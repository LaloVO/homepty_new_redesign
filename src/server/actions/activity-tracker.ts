"use server";

import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { brainFeatureStore } from "@/lib/brain-client";

/**
 * Server action to track user activity.
 * Saves to Supabase `actividad_usuario` and async-syncs to Brain Feature Store.
 */
export async function trackActivity(params: {
    tipo_actividad: string;
    modulo: string;
    entidad_id?: string;
    entidad_tipo?: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    try {
        const { userId } = await verifySession();
        const supabase = await createClient();

        // actividad_usuario table is created by migration but not yet in generated types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("actividad_usuario").insert({
            usuario_id: userId,
            tipo_actividad: params.tipo_actividad,
            modulo: params.modulo,
            entidad_id: params.entidad_id ?? null,
            entidad_tipo: params.entidad_tipo ?? null,
            metadata: params.metadata ?? {},
        });

        if (error) {
            console.error("[ActivityTracker] Error saving activity:", error.message);
            return;
        }

        // Async sync to Brain Feature Store (fire-and-forget)
        syncToBrainFeatureStore(userId).catch((err) => {
            console.warn("[ActivityTracker] Brain sync failed (non-blocking):", err.message);
        });
    } catch (err) {
        // Activity tracking should never block the user flow
        console.warn("[ActivityTracker] Failed to track activity:", err);
    }
}

/**
 * Syncs aggregated user features to the Brain Feature Store.
 * Runs async / fire-and-forget to avoid blocking the UI.
 */
async function syncToBrainFeatureStore(userId: string): Promise<void> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: searchCount } = await db
        .from("actividad_usuario")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", userId)
        .eq("tipo_actividad", "busqueda")
        .gte("created_at", thirtyDaysAgo.toISOString());

    const { count: interactionCount } = await db
        .from("actividad_usuario")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", userId)
        .gte("created_at", thirtyDaysAgo.toISOString());

    try {
        await brainFeatureStore.saveUserFeatures({
            userId,
            searchCount30d: searchCount ?? 0,
            interactionCount: interactionCount ?? 0,
        });
    } catch {
        // Brain may be unreachable — don't crash
    }
}
