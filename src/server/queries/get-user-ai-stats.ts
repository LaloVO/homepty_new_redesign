"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface UserAIStats {
    totalCopilotQueries: number;
    totalEstimations: number;
    totalPropertyViews: number;
    activeDaysLast30: number;
    aiScore: number; // 0-100 computed engagement score
}

/**
 * Computes AI usage statistics for the current user.
 * Based on activity data from `actividad_usuario` in the last 30 days.
 */
export async function getUserAIStats(): Promise<UserAIStats> {
    const defaults: UserAIStats = {
        totalCopilotQueries: 0,
        totalEstimations: 0,
        totalPropertyViews: 0,
        activeDaysLast30: 0,
        aiScore: 0,
    };

    try {
        const { userId } = await verifySession();
        if (!userId) return defaults;

        const supabase = await createClient();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("actividad_usuario")
            .select("tipo_actividad, created_at")
            .eq("usuario_id", userId)
            .gte("created_at", thirtyDaysAgo.toISOString());

        if (error || !data) {
            console.error("[getUserAIStats] Error:", error?.message);
            return defaults;
        }

        const activities = data as Array<{ tipo_actividad: string; created_at: string }>;

        const totalCopilotQueries = activities.filter(a => a.tipo_actividad === "copilot_session").length;
        const totalEstimations = activities.filter(a => a.tipo_actividad === "estimacion_valor").length;
        const totalPropertyViews = activities.filter(a => a.tipo_actividad === "vista_propiedad").length;

        // Unique active days
        const uniqueDays = new Set(activities.map(a => a.created_at.slice(0, 10)));
        const activeDaysLast30 = uniqueDays.size;

        // AI Score: weighted engagement metric (0-100)
        // Weights: copilot=3, estimations=5, views=1, active days=2
        const rawScore = (totalCopilotQueries * 3) + (totalEstimations * 5) + (totalPropertyViews * 1) + (activeDaysLast30 * 2);
        const aiScore = Math.min(100, Math.round(rawScore / 2));

        return {
            totalCopilotQueries,
            totalEstimations,
            totalPropertyViews,
            activeDaysLast30,
            aiScore,
        };
    } catch (err) {
        console.warn("[getUserAIStats] Exception:", err);
        return defaults;
    }
}
