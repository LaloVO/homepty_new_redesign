"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database";

// ──────────────────────────────────────────────
// TIPOS LOCALES
// ──────────────────────────────────────────────
export type EasyBrokerIntegration = {
    id: string;
    id_usuario: string;
    api_key: string;
    is_active: boolean;
    last_sync_at: string | null;
    last_sync_status: "success" | "error" | "pending";
    properties_synced_count: number;
    error_message: string | null;
    created_at: string;
    updated_at: string;
};

export type EasyBrokerSyncLog = {
    id: string;
    integration_id: string;
    sync_started_at: string;
    sync_completed_at: string | null;
    status: "running" | "success" | "error";
    properties_added: number;
    properties_updated: number;
    properties_failed: number;
    error_details: Record<string, unknown> | null;
    created_at: string;
};

export type ActionResponse<T = void> =
    | { ok: true; message: string; data?: T }
    | { ok: false; message: string };

// ──────────────────────────────────────────────
// HELPER: Cliente con Service Role (bulk writes, bypasa RLS)
// Usa createServerClient SIN cookie handlers para que no inyecte
// la sesión del usuario — así el service role key aplica limpiamente.
// ──────────────────────────────────────────────
function createServiceClient() {
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll: () => [],
                setAll: () => { },
            },
        }
    );
}

// ──────────────────────────────────────────────
// TIPOS INTERNOS EASYBROKER API
// ──────────────────────────────────────────────
type EBPropertyListItem = { public_id: string; updated_at: string };
type EBPropertyDetail = {
    public_id: string;
    title: string;
    description: string;
    property_type: string;
    lot_size: number | null;
    construction_size: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    parking_spaces: number | null;
    operations?: Array<{ type: string; amount: number; currency: string }>;
    location?: {
        city: string;
        state: string;
        street: string;
        postal_code: string;
        lat: number | null;   // ✅ EasyBroker incluye coordenadas GPS
        lng: number | null;
    };
    property_images?: Array<{ url: string; title: string }>;
    features?: string[];
    updated_at: string;
};

const PROPERTY_TYPE_MAP: Record<
    string,
    Database["public"]["Enums"]["tipo_propiedad"]
> = {
    house: "Casa sola",
    apartment: "Departamento",
    land: "Terreno urbano",
    lote: "Lote residencial",
    office: "Oficina corporativa",
    commercial: "Local comercial",
    warehouse: "Bodega logística",
    building: "Nave industrial",
    loft: "Loft",
};

function mapPropertyType(
    ebType: string
): Database["public"]["Enums"]["tipo_propiedad"] {
    return PROPERTY_TYPE_MAP[ebType.toLowerCase()] ?? "Departamento";
}

function matchAmenidades(
    ebFeatures: string[],
    amenidades: Array<{ id_amenidad: number; nombre_amenidad: string }>
): number[] {
    return amenidades
        .filter((a) =>
            ebFeatures.some(
                (f) =>
                    f.toLowerCase().includes(a.nombre_amenidad.toLowerCase()) ||
                    a.nombre_amenidad.toLowerCase().includes(f.toLowerCase())
            )
        )
        .map((a) => a.id_amenidad);
}

// ──────────────────────────────────────────────────────────────
// Paso 1: Buscar por nombre (ILIKE) en estados y ciudades
// ──────────────────────────────────────────────────────────────
async function resolveByName(
    supabase: Awaited<ReturnType<typeof createServiceClient>>,
    stateName: string,
    cityName: string
): Promise<{ id_estado: number; id_ciudad: number } | null> {
    if (!stateName) return null;

    const { data: estado } = await supabase
        .from("estados")
        .select("id_estado, nombre_estado")
        .ilike("nombre_estado", `%${stateName}%`)
        .limit(1)
        .maybeSingle();

    if (!estado) return null;

    // Intentar ciudad exacta primero, luego relajado
    const { data: ciudadExacta } = await supabase
        .from("ciudades")
        .select("id_ciudad")
        .eq("id_estado", estado.id_estado)
        .ilike("nombre_ciudad", `%${cityName}%`)
        .limit(1)
        .maybeSingle();

    if (ciudadExacta) return { id_estado: estado.id_estado, id_ciudad: ciudadExacta.id_ciudad };

    // Si la ciudad no matchea, tomar la primera ciudad del estado
    // (mejor que fallback global a (1,1))
    const { data: primeraciudad } = await supabase
        .from("ciudades")
        .select("id_ciudad")
        .eq("id_estado", estado.id_estado)
        .limit(1)
        .maybeSingle();

    return primeraciudad ? { id_estado: estado.id_estado, id_ciudad: primeraciudad.id_ciudad } : null;
}

// ──────────────────────────────────────────────────────────────
// Paso 2: Reverse geocoding via Mapbox (lat/lng → estado/ciudad)
// ──────────────────────────────────────────────────────────────
async function resolveByMapbox(
    supabase: Awaited<ReturnType<typeof createServiceClient>>,
    lat: number,
    lng: number
): Promise<{ id_estado: number; id_ciudad: number; stateName: string; cityName: string } | null> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return null;

    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=region,place&language=es&country=MX&access_token=${token}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;

        const json = await res.json();
        const features: Array<{ id: string; place_type: string[]; text: string }> = json.features ?? [];

        const regionFeature = features.find(f => f.place_type.includes("region"));
        const placeFeature = features.find(f => f.place_type.includes("place"));

        const mapboxState = regionFeature?.text ?? "";
        const mapboxCity = placeFeature?.text ?? "";

        if (!mapboxState) return null;

        const resolved = await resolveByName(supabase, mapboxState, mapboxCity);
        if (!resolved) return null;

        return { ...resolved, stateName: mapboxState, cityName: mapboxCity };
    } catch {
        return null;
    }
}

// ──────────────────────────────────────────────────────────────
// Orquestador: cadena ILIKE → Mapbox reverse → null
// ──────────────────────────────────────────────────────────────
async function resolveLocation(
    supabase: Awaited<ReturnType<typeof createServiceClient>>,
    stateName: string,
    cityName: string,
    lat?: number | null,
    lng?: number | null
): Promise<{ id_estado: number; id_ciudad: number; source: string } | null> {
    // 1️⃣ Intento directo por nombre
    const byName = await resolveByName(supabase, stateName, cityName);
    if (byName) return { ...byName, source: "name" };

    // 2️⃣ Reverse geocoding si hay coordenadas GPS
    if (lat && lng) {
        const byMapbox = await resolveByMapbox(supabase, lat, lng);
        if (byMapbox) return { ...byMapbox, source: `mapbox(${byMapbox.stateName}/${byMapbox.cityName})` };
    }

    return null;
}

// ──────────────────────────────────────────────
// 1. GUARDAR / ACTUALIZAR TOKEN
// ──────────────────────────────────────────────
export async function saveEasyBrokerTokenAction({
    apiKey,
}: {
    apiKey: string;
}): Promise<ActionResponse> {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const { error } = await supabase.from("easybroker_integrations").upsert(
        {
            id_usuario: userId,
            api_key: apiKey.trim(),
            is_active: true,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "id_usuario" }
    );

    if (error) {
        console.error("[EasyBroker] Error guardando token:", error);
        return { ok: false, message: "Error al guardar el token: " + error.message };
    }

    revalidatePath("/settings/integrations/easybroker");
    return { ok: true, message: "Token guardado correctamente." };
}

// ──────────────────────────────────────────────
// 2. PROBAR CONEXIÓN (valida el token con EB)
// ──────────────────────────────────────────────
export async function testEasyBrokerConnectionAction(): Promise<
    ActionResponse<{ company_name?: string; properties_count?: number }>
> {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const { data: integration, error: fetchError } = await supabase
        .from("easybroker_integrations")
        .select("api_key")
        .eq("id_usuario", userId)
        .maybeSingle();

    if (fetchError || !integration) {
        return { ok: false, message: "No hay integración configurada." };
    }

    try {
        const response = await fetch(
            "https://api.easybroker.com/v1/properties?limit=1",
            {
                headers: {
                    "X-Authorization": integration.api_key,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            return {
                ok: false,
                message:
                    response.status === 401
                        ? "Token inválido. Verifica tu API Key de EasyBroker."
                        : `Error de EasyBroker: ${response.statusText}`,
            };
        }

        const json = await response.json();
        return {
            ok: true,
            message: "Conexión exitosa con EasyBroker.",
            data: { properties_count: json.pagination?.total ?? 0 },
        };
    } catch {
        return {
            ok: false,
            message: "No se pudo conectar con EasyBroker. Verifica tu conexión.",
        };
    }
}

// ──────────────────────────────────────────────
// 3. DISPARAR SINCRONIZACIÓN MANUAL
// Lógica de sync directo en el server action:
//   - Autentica la sesión del usuario
//   - Llama a EasyBroker API con el token guardado
//   - Inserta/actualiza propiedades usando service role (para respetar la sesión
//     del usuario y a la vez poder escribir en la tabla propiedades)
// ──────────────────────────────────────────────
export async function triggerSyncAction(): Promise<ActionResponse> {
    const { userId } = await verifySession();

    // Cliente autenticado para leer datos del usuario
    const userClient = await createClient();
    // Cliente con service role para escrituras bulk a propiedades
    const serviceClient = await createServiceClient();

    // 1. Obtener integración activa del usuario
    const { data: integration, error: intError } = await userClient
        .from("easybroker_integrations")
        .select("*")
        .eq("id_usuario", userId)
        .eq("is_active", true)
        .maybeSingle();

    if (intError || !integration) {
        return { ok: false, message: "No hay integración activa configurada." };
    }

    const apiKey = integration.api_key;

    // 2. Crear registro de log (status: running)
    const { data: logEntry, error: logError } = await serviceClient
        .from("easybroker_sync_logs")
        .insert({
            integration_id: integration.id,
            sync_started_at: new Date().toISOString(),
            status: "running",
        })
        .select("id")
        .single();

    if (logError || !logEntry) {
        console.error("[EasyBroker] Error creando log:", logError);
        return {
            ok: false,
            message: logError
                ? `Error al iniciar la sincronización: ${logError.message}`
                : "Error al iniciar la sincronización (log entry vacío).",
        };
    }

    const logId = logEntry.id;

    // 3. Cargar amenidades del sistema
    const { data: amenidades } = await serviceClient
        .from("amenidades")
        .select("id_amenidad, nombre_amenidad");

    let added = 0;
    let updated = 0;
    let failed = 0;
    const errorDetails: Record<string, string> = {};

    try {
        // 4. Obtener listado de propiedades con paginación
        let page = 1;
        let hasMore = true;
        const allProperties: EBPropertyListItem[] = [];

        while (hasMore) {
            const listRes = await fetch(
                `https://api.easybroker.com/v1/properties?limit=50&page=${page}`,
                {
                    headers: { "X-Authorization": apiKey },
                    cache: "no-store",
                }
            );

            if (!listRes.ok) {
                const msg = listRes.status === 401
                    ? "Token de EasyBroker inválido o expirado."
                    : `Error API EasyBroker: ${listRes.statusText}`;
                throw new Error(msg);
            }

            const listJson = await listRes.json();
            const items: EBPropertyListItem[] = listJson.content ?? [];
            allProperties.push(...items);

            const pagination = listJson.pagination ?? {};
            hasMore = items.length === 50 && pagination.total > allProperties.length;
            page++;
        }

        // 5. Para cada propiedad, obtener detalle y sincronizar
        const L = "[EasyBroker]";
        const BAR = "━".repeat(60);
        console.log(`\n${L} ${BAR}`);
        console.log(`${L} 🔄 INICIO DE SINCRONIZACIÓN`);
        console.log(`${L} 👤 Usuario: ${userId}`);
        console.log(`${L} 📦 Total propiedades a procesar: ${allProperties.length}`);
        console.log(`${L} ${BAR}`);
        // L y BAR disponibles para todo el scope del try

        for (let i = 0; i < allProperties.length; i++) {
            const item = allProperties[i];
            const idx = `[${i + 1}/${allProperties.length}]`;
            try {
                const detailRes = await fetch(
                    `https://api.easybroker.com/v1/properties/${item.public_id}`,
                    {
                        headers: { "X-Authorization": apiKey },
                        cache: "no-store",
                    }
                );

                if (!detailRes.ok) {
                    failed++;
                    const errMsg = `HTTP ${detailRes.status}`;
                    errorDetails[item.public_id] = errMsg;
                    console.log(`${L} ${idx} ❌ ${item.public_id} — Error detalle: ${errMsg}`);
                    continue;
                }

                const prop: EBPropertyDetail = await detailRes.json();

                // ── Resolver ubicación ──────────────────────────
                const ebState = prop.location?.state ?? "";
                const ebCity = prop.location?.city ?? "";
                const ebLat = prop.location?.lat;
                const ebLng = prop.location?.lng;
                const location = await resolveLocation(serviceClient, ebState, ebCity, ebLat, ebLng);
                const locationStr = location
                    ? `${ebState}, ${ebCity} → estado_id=${location.id_estado}, ciudad_id=${location.id_ciudad} [${location.source}] ✓`
                    : `⚠️  "${ebState} / ${ebCity}" NO resuelto (sin lat/lng o sin match en BD) → usando fallback (1,1)`;

                // ── Operación y precio ──────────────────────────
                const operation = prop.operations?.[0];
                const precio = operation?.amount ?? 0;
                const tipoAccion = operation?.type === "sale" ? 1 : 2;
                const tipoAccionStr = operation?.type === "sale" ? "Venta" : "Renta";

                // ── Tipo de propiedad ───────────────────────────
                const tipoProp = mapPropertyType(prop.property_type ?? "house");
                const isLand = ["land", "lote", "terreno"].some(t =>
                    (prop.property_type ?? "").toLowerCase().includes(t)
                );

                // ── Áreas — terrenos usan lot_size, no construction ──
                const rawLot = prop.lot_size;
                const rawConst = prop.construction_size;
                const area = Math.round(rawLot ?? rawConst ?? 0);
                const area_construida = Math.round(rawConst ?? 0);

                // ── Imágenes y amenidades ───────────────────────
                const imagesJson = prop.property_images?.map((img) => img.url) ?? [];
                const featuresJson = prop.features ?? [];
                const matchedAmenidades = matchAmenidades(featuresJson, amenidades ?? []);

                // ── Log de propiedad ────────────────────────────
                console.log(`${L} ${idx} 🏠 ${prop.public_id}`);
                console.log(`${L}   ├─ Nombre:      ${prop.title ?? "(sin título)"}`);
                console.log(`${L}   ├─ Tipo EB:     ${prop.property_type} → ${tipoProp}${isLand ? " (TERRENO)" : ""}`);
                console.log(`${L}   ├─ Operación:   ${tipoAccionStr} | Precio: $${precio.toLocaleString("es-MX")}`);
                console.log(`${L}   ├─ Área:        lot_size=${rawLot ?? "null"}, construction_size=${rawConst ?? "null"} → area=${area}m², area_construida=${area_construida}m²`);
                if (!isLand) {
                    console.log(`${L}   ├─ Recámaras:  ${prop.bedrooms ?? 0} | Baños: ${prop.bathrooms ?? 0} | Estac: ${prop.parking_spaces ?? 0}`);
                }
                console.log(`${L}   ├─ Ubicación:   ${locationStr}`);
                console.log(`${L}   ├─ Dirección:   ${prop.location?.street ?? "(sin calle)"}, CP: ${prop.location?.postal_code ?? "?"}`);
                console.log(`${L}   ├─ Imágenes:    ${imagesJson.length} | Features EB: ${featuresJson.length} | Amenidades match: ${matchedAmenidades.length}`);

                const propiedadData = {
                    nombre: prop.title ?? `Propiedad ${prop.public_id}`,
                    descripcion: prop.description ?? "",
                    descripcion_estado: "",
                    precio,
                    area,
                    area_construida,
                    habitaciones: prop.bedrooms ?? 0,
                    banios: prop.bathrooms ?? 0,
                    estacionamientos: prop.parking_spaces ?? 0,
                    tipo: tipoProp,
                    id_tipo_accion: tipoAccion,
                    id_tipo_uso: 1,
                    id_estado: location?.id_estado ?? 1,
                    id_ciudad: location?.id_ciudad ?? 1,
                    // Nombres desnormalizados para evitar JOINs en reads (UI los usa directamente)
                    estado_nombre: location?.source === "name"
                        ? ebState
                        : (location?.source?.match(/mapbox\((.+?)\//)?.[1] ?? ebState ?? null),
                    ciudad_nombre: location?.source === "name"
                        ? ebCity
                        : (location?.source?.match(/\/(.+?)\)/)?.[1] ?? ebCity ?? null),
                    // Dirección: EasyBroker manda la colonia en `street`, complementamos con city/state
                    direccion: [prop.location?.street, ebCity].filter(Boolean).join(", "),
                    codigo_postal: prop.location?.postal_code ?? null,
                    id_usuario: userId,
                    is_unit: true,
                    easybroker_id: prop.public_id,
                    easybroker_images_json: imagesJson as unknown as Database["public"]["Tables"]["propiedades"]["Insert"]["easybroker_images_json"],
                    easybroker_features: featuresJson as unknown as Database["public"]["Tables"]["propiedades"]["Insert"]["easybroker_features"],
                    easybroker_source_data: prop as unknown as Database["public"]["Tables"]["propiedades"]["Insert"]["easybroker_source_data"],
                    updated_at: new Date().toISOString(),
                };

                // Verificar si ya existe
                const { data: existing } = await serviceClient
                    .from("propiedades")
                    .select("id")
                    .eq("easybroker_id", prop.public_id)
                    .maybeSingle();

                if (existing) {
                    const { error: updateErr } = await serviceClient
                        .from("propiedades")
                        .update(propiedadData)
                        .eq("id", existing.id);

                    if (updateErr) {
                        failed++;
                        errorDetails[prop.public_id] = updateErr.message;
                        console.log(`${L}   └─ ❌ UPDATE ERROR: ${updateErr.message}`);
                        continue;
                    }

                    await serviceClient.from("imagenes_propiedades").delete().eq("id_propiedad", existing.id);
                    if (imagesJson.length > 0) {
                        await serviceClient.from("imagenes_propiedades").insert(
                            imagesJson.map((url) => ({ id_propiedad: existing.id, image_url: url }))
                        );
                    }

                    if (matchedAmenidades.length > 0) {
                        await serviceClient.from("amenidades_propiedades").delete().eq("id_propiedad", existing.id);
                        await serviceClient.from("amenidades_propiedades").insert(
                            matchedAmenidades.map((id_amenidad) => ({ id_propiedad: existing.id, id_amenidad }))
                        );
                    }

                    updated++;
                    console.log(`${L}   └─ 🔄 ACTUALIZADA (id: ${existing.id})`);
                } else {
                    const { data: newProp, error: insertErr } = await serviceClient
                        .from("propiedades")
                        .insert(propiedadData)
                        .select("id")
                        .single();

                    if (insertErr || !newProp) {
                        failed++;
                        const errMsg = insertErr?.message ?? "Error desconocido";
                        errorDetails[prop.public_id] = errMsg;
                        console.log(`${L}   └─ ❌ INSERT ERROR: ${errMsg}`);
                        continue;
                    }

                    if (imagesJson.length > 0) {
                        await serviceClient.from("imagenes_propiedades").insert(
                            imagesJson.map((url) => ({ id_propiedad: newProp.id, image_url: url }))
                        );
                    }

                    if (matchedAmenidades.length > 0) {
                        await serviceClient.from("amenidades_propiedades").insert(
                            matchedAmenidades.map((id_amenidad) => ({ id_propiedad: newProp.id, id_amenidad }))
                        );
                    }

                    added++;
                    console.log(`${L}   └─ ✅ NUEVA insertada (id: ${newProp.id})`);
                }
            } catch (propErr) {
                failed++;
                errorDetails[item.public_id] = String(propErr);
                console.log(`${L} ${idx} ❌ ${item.public_id} — EXCEPCIÓN: ${propErr}`);
            }
        }

        // ── Resumen final ────────────────────────────────────────
        console.log(`\n${L} ${BAR}`);
        console.log(`${L} ✅ Nuevas:       ${added}`);
        console.log(`${L} 🔄 Actualizadas: ${updated}`);
        console.log(`${L} ❌ Fallidas:     ${failed}`);
        if (Object.keys(errorDetails).length > 0) {
            console.log(`${L} 📋 Errores por propiedad:`);
            for (const [pid, err] of Object.entries(errorDetails)) {
                console.log(`${L}    • ${pid}: ${err}`);
            }
        }
        console.log(`${L} ${BAR}\n`);

        // 6. Actualizar log a success
        await serviceClient
            .from("easybroker_sync_logs")
            .update({
                status: "success",
                sync_completed_at: new Date().toISOString(),
                properties_added: added,
                properties_updated: updated,
                properties_failed: failed,
                error_details: Object.keys(errorDetails).length > 0 ? errorDetails : null,
            })
            .eq("id", logId);

        // 7. Actualizar estado de la integración
        await userClient
            .from("easybroker_integrations")
            .update({
                last_sync_at: new Date().toISOString(),
                last_sync_status: "success",
                properties_synced_count: added + updated,
                error_message: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", integration.id);

        revalidatePath("/settings/integrations/easybroker");
        return {
            ok: true,
            message: `Sincronización completada: ${added} nuevas, ${updated} actualizadas${failed > 0 ? `, ${failed} fallidas` : ""}.`,
        };

    } catch (err) {
        const errMsg = String(err);
        console.error("[EasyBroker] Error en sync:", errMsg);

        await serviceClient
            .from("easybroker_sync_logs")
            .update({
                status: "error",
                sync_completed_at: new Date().toISOString(),
                error_details: { fatal: errMsg },
            })
            .eq("id", logId);

        await userClient
            .from("easybroker_integrations")
            .update({
                last_sync_at: new Date().toISOString(),
                last_sync_status: "error",
                error_message: errMsg,
                updated_at: new Date().toISOString(),
            })
            .eq("id", integration.id);

        return { ok: false, message: errMsg };
    }
}

// ──────────────────────────────────────────────
// 4. OBTENER ESTADO DE LA INTEGRACIÓN
// ──────────────────────────────────────────────
export async function getIntegrationStatusAction(): Promise<
    ActionResponse<EasyBrokerIntegration | null>
> {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("easybroker_integrations")
        .select("*")
        .eq("id_usuario", userId)
        .maybeSingle();

    if (error) {
        return { ok: false, message: "Error al obtener estado: " + error.message };
    }

    return {
        ok: true,
        message: "Estado obtenido.",
        data: data as EasyBrokerIntegration | null,
    };
}

// ──────────────────────────────────────────────
// 5. HISTORIAL DE SINCRONIZACIONES
// ──────────────────────────────────────────────
export async function getSyncHistoryAction(): Promise<
    ActionResponse<EasyBrokerSyncLog[]>
> {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const { data: integration } = await supabase
        .from("easybroker_integrations")
        .select("id")
        .eq("id_usuario", userId)
        .maybeSingle();

    if (!integration) {
        return { ok: true, message: "Sin historial.", data: [] };
    }

    const { data, error } = await supabase
        .from("easybroker_sync_logs")
        .select("*")
        .eq("integration_id", integration.id)
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        return { ok: false, message: "Error al obtener historial: " + error.message };
    }

    return {
        ok: true,
        message: "Historial obtenido.",
        data: (data ?? []) as EasyBrokerSyncLog[],
    };
}

// ──────────────────────────────────────────────
// 6. ACTIVAR / DESACTIVAR INTEGRACIÓN
// ──────────────────────────────────────────────
export async function toggleIntegrationAction({
    isActive,
}: {
    isActive: boolean;
}): Promise<ActionResponse> {
    const { userId } = await verifySession();
    const supabase = await createClient();

    const { error } = await supabase
        .from("easybroker_integrations")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id_usuario", userId);

    if (error) {
        return { ok: false, message: "Error al actualizar: " + error.message };
    }

    revalidatePath("/settings/integrations/easybroker");
    return {
        ok: true,
        message: isActive ? "Integración activada." : "Integración desactivada.",
    };
}
