"use server";

import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CopilotMessage, CopilotSession } from "@/lib/brain-types";

/**
 * Retrieves the user's past Copilot conversation sessions from `actividad_usuario`.
 */
export async function getCopilotSessions(limit: number = 20): Promise<CopilotSession[]> {
    try {
        const { userId } = await verifySession();
        if (!userId) return [];

        const supabase = await createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("actividad_usuario")
            .select("id, created_at, metadata")
            .eq("usuario_id", userId)
            .eq("tipo_actividad", "copilot_session")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error || !data) {
            console.error("[CopilotHistory] Failed to fetch sessions:", error?.message);
            return [];
        }

        const sessions: CopilotSession[] = data.map((row: any) => ({
            id: row.id.toString(),
            sessionId: row.metadata.sessionId || row.id.toString(),
            title: row.metadata.title || "Nueva conversación",
            messages: row.metadata.messages || [],
            updatedAt: row.created_at,
        }));

        return sessions;
    } catch (err) {
        console.warn("[CopilotHistory] Error:", err);
        return [];
    }
}

/**
 * Creates or updates a Copilot session with the full messages array.
 */
export async function saveCopilotSession(
    sessionId: string,
    title: string,
    messages: CopilotMessage[]
): Promise<boolean> {
    try {
        const { userId } = await verifySession();
        if (!userId) return false;

        const supabase = await createClient();

        // Check if session exists using JSONB query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingRows, error: fetchErr } = await (supabase as any)
            .from("actividad_usuario")
            .select("id, metadata")
            .eq("tipo_actividad", "copilot_session")
            .eq("usuario_id", userId)
            .contains("metadata", { sessionId });

        const newMeta = {
            sessionId,
            title,
            messages,
        };

        if (existingRows && existingRows.length > 0) {
            // Update first match
            const rowId = existingRows[0].id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateErr } = await (supabase as any)
                .from("actividad_usuario")
                .update({ metadata: { ...existingRows[0].metadata, ...newMeta } })
                .eq("id", rowId)
                .eq("usuario_id", userId);

            if (updateErr) {
                console.error("[CopilotHistory] Session Update error:", updateErr.message);
                return false;
            }
        } else {
            // Insert new row
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: insertErr } = await (supabase as any)
                .from("actividad_usuario")
                .insert({
                    usuario_id: userId,
                    tipo_actividad: "copilot_session",
                    modulo: "copilot",
                    metadata: newMeta
                });

            if (insertErr) {
                console.error("[CopilotHistory] Session Insert error:", insertErr.message);
                return false;
            }
        }

        return true;
    } catch (err) {
        console.warn("[CopilotHistory] Session save exception:", err);
        return false;
    }
}

/**
 * Deletes a specific Copilot session entry (row) from `actividad_usuario`.
 */
export async function deleteCopilotSession(id: string): Promise<boolean> {
    try {
        const { userId } = await verifySession();
        if (!userId) return false;

        const supabase = await createClient();
        const numericId = Number(id);

        if (isNaN(numericId)) {
            console.error("[CopilotHistory] Delete: invalid id", id);
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error, count } = await (supabase as any)
            .from("actividad_usuario")
            .delete({ count: "exact" })
            .eq("id", numericId)
            .eq("usuario_id", userId);

        if (error) {
            console.error("[CopilotHistory] Delete error:", error.message, error.details);
            return false;
        }

        if (count === 0) {
            console.warn("[CopilotHistory] Delete: no rows affected for id", numericId);
        }

        return true;
    } catch (err) {
        console.warn("[CopilotHistory] Delete exception:", err);
        return false;
    }
}

/**
 * Updates the title of a specific Copilot session in its metadata.
 */
export async function updateCopilotSessionTitle(id: string, title: string): Promise<boolean> {
    try {
        const { userId } = await verifySession();
        if (!userId) return false;

        const supabase = await createClient();
        const numericId = Number(id);

        if (isNaN(numericId)) {
            console.error("[CopilotHistory] Update: invalid id", id);
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: row, error: fetchErr } = await (supabase as any)
            .from("actividad_usuario")
            .select("metadata")
            .eq("id", numericId)
            .eq("usuario_id", userId)
            .single();

        if (fetchErr || !row) {
            console.error("[CopilotHistory] Fetch for update error:", fetchErr?.message, fetchErr?.details);
            return false;
        }

        const newMeta = {
            ...(row.metadata || {}),
            title,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateErr } = await (supabase as any)
            .from("actividad_usuario")
            .update({ metadata: newMeta })
            .eq("id", numericId)
            .eq("usuario_id", userId);

        if (updateErr) {
            console.error("[CopilotHistory] Update error:", updateErr.message, updateErr.details);
            return false;
        }

        return true;
    } catch (err) {
        console.warn("[CopilotHistory] Update exception:", err);
        return false;
    }
}
