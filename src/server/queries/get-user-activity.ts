"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface RecentActivity {
    id: number;
    tipo_actividad: string;
    modulo: string;
    entidad_tipo: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

/**
 * Fetches the most recent user activities from `actividad_usuario`.
 */
export async function getRecentActivity(limit: number = 5): Promise<RecentActivity[]> {
    try {
        const { userId } = await verifySession();
        if (!userId) return [];

        const supabase = await createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("actividad_usuario")
            .select("id, tipo_actividad, modulo, entidad_tipo, metadata, created_at")
            .eq("usuario_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error || !data) {
            console.error("[getRecentActivity] Error:", error?.message);
            return [];
        }

        return data as RecentActivity[];
    } catch (err) {
        console.warn("[getRecentActivity] Exception:", err);
        return [];
    }
}
