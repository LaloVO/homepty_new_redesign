import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// TYPES
// ============================================================

export interface CrmDashboardData {
    // Card stats
    propiedadesVenta: number;
    propiedadesRenta: number;
    visitasMensuales: number;
    totalPropiedades: number;
    totalClientes: number;
    totalOfertas: number;

    // Chart: ventas anuales (últimos 6 meses)
    ventasPorMes: Array<{
        month: string;
        ventas: number;
        alquileres: number;
    }>;

    // Chart: tipos de propiedades
    tiposPropiedades: Array<{
        type: string;
        quantity: number;
        fill: string;
    }>;

    // Chart: localización de propiedades
    localizacion: Array<{
        city: string;
        properties: number;
        percentage: number;
    }>;

    // Chart: progreso de cierres
    cierres: {
        completados: number;
        total: number;
        porcentaje: number;
    };
}

// Color palette for property types chart
const TYPE_COLORS = [
    "var(--color-chrome)",
    "var(--color-safari)",
    "var(--color-firefox)",
    "var(--color-edge)",
    "var(--color-other)",
];

// Spanish month names
const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ============================================================
// QUERY
// ============================================================

export async function getCrmDashboardStats(): Promise<CrmDashboardData> {
    const { userId } = await verifySession();
    const supabase = await createClient();

    // --- Run typed queries in parallel ---
    const [propertiesRes, clientsRes, offersRes] = await Promise.all([
        // All properties by user
        supabase
            .from("propiedades")
            .select("id, tipo, id_tipo_accion, id_estado, created_at")
            .eq("id_usuario", userId),

        // Client count
        supabase
            .from("clientes")
            .select("id_cliente", { count: "exact", head: true })
            .eq("id_usuario", userId),

        // All offers
        supabase
            .from("ofertas")
            .select("id, status, created_at")
            .eq("user_id", userId),
    ]);


    const properties = propertiesRes.data ?? [];
    const offers = offersRes.data ?? [];
    const totalClientes = clientsRes.count ?? 0;

    // Monthly visits: count views received on THIS user's properties
    // Filter by entidad_id IN (user's property IDs) — any visitor counts
    const propertyIds = properties.map((p) => String(p.id));
    let visitasMensuales = 0;
    if (propertyIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activityRes = await (supabase as any)
            .from("actividad_usuario")
            .select("id", { count: "exact", head: true })
            .eq("tipo_actividad", "vista_propiedad")
            .in("entidad_id", propertyIds)
            .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
        visitasMensuales = activityRes.count ?? 0;
    }


    // --- Card Stats ---
    const propiedadesVenta = properties.filter((p) => p.id_tipo_accion === 1).length;
    const propiedadesRenta = properties.filter((p) => p.id_tipo_accion === 2).length;
    const totalPropiedades = properties.length;
    const totalOfertas = offers.length;

    // --- Chart: Ventas por mes (últimos 6 meses) ---
    const now = new Date();
    const ventasPorMes: CrmDashboardData["ventasPorMes"] = [];
    for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = MONTH_NAMES[monthDate.getMonth()];

        const ventasMes = properties.filter((p) => {
            const d = new Date(p.created_at);
            return d >= monthDate && d <= monthEnd && p.id_tipo_accion === 1;
        }).length;

        const alquileresMes = properties.filter((p) => {
            const d = new Date(p.created_at);
            return d >= monthDate && d <= monthEnd && p.id_tipo_accion === 2;
        }).length;

        ventasPorMes.push({
            month: monthName,
            ventas: ventasMes,
            alquileres: alquileresMes,
        });
    }

    // --- Chart: Tipos de propiedades ---
    const typeCountMap = new Map<string, number>();
    for (const p of properties) {
        const tipo = p.tipo ?? "Otro";
        typeCountMap.set(tipo, (typeCountMap.get(tipo) ?? 0) + 1);
    }
    const tiposPropiedades = Array.from(typeCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, quantity], i) => ({
            type,
            quantity,
            fill: TYPE_COLORS[i % TYPE_COLORS.length],
        }));

    // --- Chart: Localización por estado ---
    const stateIds = [...new Set(properties.map((p) => p.id_estado))];
    let stateNameMap = new Map<number, string>();

    if (stateIds.length > 0) {
        const { data: estados } = await supabase
            .from("estados")
            .select("id_estado, nombre_estado")
            .in("id_estado", stateIds);

        if (estados) {
            stateNameMap = new Map(estados.map((e) => [e.id_estado, e.nombre_estado]));
        }
    }

    const locationCountMap = new Map<string, number>();
    for (const p of properties) {
        const stateName = stateNameMap.get(p.id_estado) ?? "Desconocido";
        locationCountMap.set(stateName, (locationCountMap.get(stateName) ?? 0) + 1);
    }

    const localizacion = Array.from(locationCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([city, count]) => ({
            city,
            properties: count,
            percentage: totalPropiedades > 0
                ? Math.round((count / totalPropiedades) * 1000) / 10
                : 0,
        }));

    // --- Chart: Progreso de cierres ---
    // offer_status enum: 'Activa'|'Pausada'. 'Pausada' = completed/closed deals
    const ofertasCerradas = offers.filter((o) => o.status === "Pausada").length;
    const cierres = {
        completados: ofertasCerradas,
        total: totalOfertas,
        porcentaje: totalOfertas > 0
            ? Math.round((ofertasCerradas / totalOfertas) * 100)
            : 0,
    };

    return {
        propiedadesVenta,
        propiedadesRenta,
        visitasMensuales,
        totalPropiedades,
        totalClientes,
        totalOfertas,
        ventasPorMes,
        tiposPropiedades,
        localizacion,
        cierres,
    };
}
