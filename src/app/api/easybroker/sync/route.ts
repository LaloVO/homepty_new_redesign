import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/database";

// ─────────────────────────────────────────────────────────────
// TIPOS DE LA API DE EASYBROKER
// ─────────────────────────────────────────────────────────────
type EBPropertyListItem = {
    public_id: string;
    updated_at: string;
};

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
    show_prices: boolean;
    operations?: Array<{ type: string; amount: number; currency: string }>;
    location?: {
        city: string;
        state: string;
        street: string;
        postal_code: string;
        lat: number;
        lng: number;
    };
    property_images?: Array<{ url: string; title: string }>;
    features?: string[];
    updated_at: string;
};

// ─────────────────────────────────────────────────────────────
// HELPER: Crear cliente Supabase con service role
// (para escribir en tablas con RLS restrictivo)
// ─────────────────────────────────────────────────────────────
async function createServiceClient() {
    const cookieStore = await cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    try {
                        cookiesToSet.forEach(({ name, value }) =>
                            cookieStore.set(name, value)
                        );
                    } catch { }
                },
            },
        }
    );
}

// ─────────────────────────────────────────────────────────────
// MAPPER: Tipo de propiedad EasyBroker → Enum homepty_new
// Enum real: "Casa" | "Departamento" | "Terreno" | "Oficina" |
//            "Local comercial" | "Bodega" | "Lote" | "Loft" | "Nave comercial"
// ─────────────────────────────────────────────────────────────
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


// ─────────────────────────────────────────────────────────────
// MATCHER: features de EasyBroker → id_amenidad de homepty
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// GEOCODIFICACIÓN: Buscar id_estado / id_ciudad en BD
// ─────────────────────────────────────────────────────────────
async function resolveLocation(
    supabase: Awaited<ReturnType<typeof createServiceClient>>,
    stateName: string,
    cityName: string
): Promise<{ id_estado: number; id_ciudad: number } | null> {
    const { data: estado } = await supabase
        .from("estados")
        .select("id_estado")
        .ilike("nombre_estado", `%${stateName}%`)
        .limit(1)
        .maybeSingle();

    if (!estado) return null;

    const { data: ciudad } = await supabase
        .from("ciudades")
        .select("id_ciudad")
        .eq("id_estado", estado.id_estado)
        .ilike("nombre_ciudad", `%${cityName}%`)
        .limit(1)
        .maybeSingle();

    if (!ciudad) return null;

    return { id_estado: estado.id_estado, id_ciudad: ciudad.id_ciudad };
}

// ─────────────────────────────────────────────────────────────
// POST /api/easybroker/sync
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body.userId;

    if (!userId) {
        return NextResponse.json({ message: "userId requerido." }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // 1. Obtener la integración del usuario
    const { data: integration, error: intError } = await supabase
        .from("easybroker_integrations")
        .select("*")
        .eq("id_usuario", userId)
        .eq("is_active", true)
        .maybeSingle();

    if (intError || !integration) {
        return NextResponse.json(
            { message: "Integración no encontrada o inactiva." },
            { status: 404 }
        );
    }

    const apiKey = integration.api_key;

    // 2. Crear registro de log (status: running)
    const { data: logEntry, error: logError } = await supabase
        .from("easybroker_sync_logs")
        .insert({
            integration_id: integration.id,
            sync_started_at: new Date().toISOString(),
            status: "running",
        })
        .select("id")
        .single();

    if (logError || !logEntry) {
        return NextResponse.json(
            { message: "Error creando log de sincronización." },
            { status: 500 }
        );
    }

    const logId = logEntry.id;

    // 3. Cargar amenidades del sistema para el matcher
    const { data: amenidades } = await supabase
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

            if (!listRes.ok) throw new Error(`Error API EB: ${listRes.statusText}`);

            const listJson = await listRes.json();
            const items: EBPropertyListItem[] = listJson.content ?? [];
            allProperties.push(...items);

            const pagination = listJson.pagination ?? {};
            hasMore =
                items.length === 50 &&
                pagination.total > allProperties.length;
            page++;
        }

        // 5. Para cada propiedad, obtener detalle completo y sincronizar
        for (const item of allProperties) {
            try {
                // Paso B: Detalle obligatorio (donde vienen features, images, description)
                const detailRes = await fetch(
                    `https://api.easybroker.com/v1/properties/${item.public_id}`,
                    {
                        headers: { "X-Authorization": apiKey },
                        cache: "no-store",
                    }
                );

                if (!detailRes.ok) {
                    failed++;
                    errorDetails[item.public_id] = `HTTP ${detailRes.status}`;
                    continue;
                }

                const prop: EBPropertyDetail = await detailRes.json();

                // Resolver ubicación
                const location = await resolveLocation(
                    supabase,
                    prop.location?.state ?? "",
                    prop.location?.city ?? ""
                );

                // Precio desde operaciones
                const operation = prop.operations?.[0];
                const precio = operation?.amount ?? 0;
                const tipoAccion = operation?.type === "sale" ? 1 : 2; // 1=venta, 2=renta

                // Tipo de propiedad
                const tipoProp = mapPropertyType(prop.property_type ?? "house");

                // Imágenes y features
                const imagesJson =
                    prop.property_images?.map((img) => img.url) ?? [];
                const featuresJson = prop.features ?? [];

                // Amenidades locales matcheadas
                const matchedAmenidades = matchAmenidades(
                    featuresJson,
                    amenidades ?? []
                );

                // Datos base de la propiedad a insertar/actualizar
                const propiedadData = {
                    nombre: prop.title ?? `Propiedad ${prop.public_id}`,
                    descripcion: prop.description ?? "",
                    descripcion_estado: "",
                    precio: precio,
                    area: Math.round(prop.lot_size ?? prop.construction_size ?? 0),
                    area_construida: Math.round(prop.construction_size ?? 0),
                    habitaciones: prop.bedrooms ?? 0,
                    banios: prop.bathrooms ?? 0,
                    estacionamientos: prop.parking_spaces ?? 0,
                    tipo: tipoProp,
                    id_tipo_accion: tipoAccion,
                    id_tipo_uso: 1, // Residencial por defecto
                    id_estado: location?.id_estado ?? 1,
                    id_ciudad: location?.id_ciudad ?? 1,
                    direccion: prop.location?.street ?? "",
                    codigo_postal: prop.location?.postal_code ?? null,
                    id_usuario: userId,
                    is_unit: true,
                    easybroker_id: prop.public_id,
                    easybroker_images_json: imagesJson,
                    easybroker_features: featuresJson,
                    easybroker_source_data: prop as unknown as import("@/types/database").Json,
                    updated_at: new Date().toISOString(),
                };

                // Verificar si ya existe
                const { data: existing } = await supabase
                    .from("propiedades")
                    .select("id")
                    .eq("easybroker_id", prop.public_id)
                    .maybeSingle();

                if (existing) {
                    // Actualizar
                    const { error: updateErr } = await supabase
                        .from("propiedades")
                        .update(propiedadData)
                        .eq("id", existing.id);

                    if (updateErr) {
                        failed++;
                        errorDetails[prop.public_id] = updateErr.message;
                        continue;
                    }

                    // Actualizar imágenes: borrar anteriores e insertar nuevas
                    await supabase
                        .from("imagenes_propiedades")
                        .delete()
                        .eq("id_propiedad", existing.id);

                    if (imagesJson.length > 0) {
                        await supabase.from("imagenes_propiedades").insert(
                            imagesJson.map((url: string) => ({
                                id_propiedad: existing.id,
                                image_url: url,
                            }))
                        );
                    }

                    // Actualizar amenidades
                    if (matchedAmenidades.length > 0) {
                        await supabase
                            .from("amenidades_propiedades")
                            .delete()
                            .eq("id_propiedad", existing.id);

                        await supabase.from("amenidades_propiedades").insert(
                            matchedAmenidades.map((id_amenidad) => ({
                                id_propiedad: existing.id,
                                id_amenidad,
                            }))
                        );
                    }

                    updated++;
                } else {
                    // Insertar nueva
                    const { data: newProp, error: insertErr } = await supabase
                        .from("propiedades")
                        .insert(propiedadData)
                        .select("id")
                        .single();

                    if (insertErr || !newProp) {
                        failed++;
                        errorDetails[prop.public_id] = insertErr?.message ?? "Error desconocido";
                        continue;
                    }

                    // Insertar imágenes
                    if (imagesJson.length > 0) {
                        await supabase.from("imagenes_propiedades").insert(
                            imagesJson.map((url: string) => ({
                                id_propiedad: newProp.id,
                                image_url: url,
                            }))
                        );
                    }

                    // Insertar amenidades
                    if (matchedAmenidades.length > 0) {
                        await supabase.from("amenidades_propiedades").insert(
                            matchedAmenidades.map((id_amenidad) => ({
                                id_propiedad: newProp.id,
                                id_amenidad,
                            }))
                        );
                    }

                    added++;
                }
            } catch (propErr) {
                failed++;
                errorDetails[item.public_id] = String(propErr);
            }
        }

        // 6. Actualizar log a success
        await supabase
            .from("easybroker_sync_logs")
            .update({
                status: "success",
                sync_completed_at: new Date().toISOString(),
                properties_added: added,
                properties_updated: updated,
                properties_failed: failed,
                error_details:
                    Object.keys(errorDetails).length > 0 ? errorDetails : null,
            })
            .eq("id", logId);

        // 7. Actualizar integración
        await supabase
            .from("easybroker_integrations")
            .update({
                last_sync_at: new Date().toISOString(),
                last_sync_status: "success",
                properties_synced_count: added + updated,
                error_message: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", integration.id);

        return NextResponse.json({ ok: true, added, updated, failed });
    } catch (err) {
        const errMsg = String(err);

        // Actualizar log a error
        await supabase
            .from("easybroker_sync_logs")
            .update({
                status: "error",
                sync_completed_at: new Date().toISOString(),
                error_details: { fatal: errMsg },
            })
            .eq("id", logId);

        await supabase
            .from("easybroker_integrations")
            .update({
                last_sync_at: new Date().toISOString(),
                last_sync_status: "error",
                error_message: errMsg,
                updated_at: new Date().toISOString(),
            })
            .eq("id", integration.id);

        return NextResponse.json(
            { message: "Error en sincronización: " + errMsg },
            { status: 500 }
        );
    }
}
