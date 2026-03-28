"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getCopilotSessions, saveCopilotSession, deleteCopilotSession, updateCopilotSessionTitle } from "@/server/actions/copilot/history";
import type { CopilotMessage, CopilotContext, CopilotSession } from "@/lib/brain-types";

/**
 * Hook for the AI Copilot connected to Brain LLM via tRPC (HTTP).
 * Communicates through /api/copilot API route (server-side proxy).
 */
export function useCopilotAI(context?: CopilotContext) {
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<CopilotMessage[]>([]);
    const [historySessions, setHistorySessions] = useState<CopilotSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const contextRef = useRef(context);

    // Keep context ref updated
    useEffect(() => {
        contextRef.current = context;
    }, [context]);

    const fetchHistory = useCallback(async () => {
        try {
            const history = await getCopilotSessions();
            setHistorySessions(history);
        } catch (err) {
            console.warn("[useCopilotAI] Failed to load history:", err);
        }
    }, []);

    // Load history on mount
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        // Abort previous request if any
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Add user message
        const userMessage: CopilotMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: content.trim(),
            timestamp: new Date().toISOString(),
            isComplete: true,
        };

        // Add placeholder assistant message
        const assistantMessage: CopilotMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            isComplete: false,
        };

        let activeSessionId = currentSessionId;
        if (!activeSessionId) {
            activeSessionId = crypto.randomUUID();
            setCurrentSessionId(activeSessionId);
        }

        const initialMessages = [...messages, userMessage, assistantMessage];
        setMessages(initialMessages);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/copilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: content.trim(),
                    context: contextRef.current,
                }),
                signal: controller.signal,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al contactar el copilot");
            }

            // Update assistant message with response
            setMessages((prev) => {
                const updated = prev.map((msg) =>
                    msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            content: data.response || "Sin respuesta",
                            isComplete: true,
                        }
                        : msg
                );

                // Refrescar el historial para que recoja esta nueva pregunta-respuesta
                // Save full session
                if (activeSessionId) {
                    const title = updated.find((m) => m.role === "user")?.content || "Nueva conversación";
                    saveCopilotSession(activeSessionId, title, updated).then(() => fetchHistory());
                }

                return updated;
            });
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") return;

            const errorMsg = err instanceof Error ? err.message : "Error desconocido";
            setError(errorMsg);

            // Update assistant message with error
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            content: `⚠️ ${errorMsg}`,
                            isComplete: true,
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, fetchHistory]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setCurrentSessionId(null);
        setError(null);
    }, []);

    const restoreSession = useCallback((session: CopilotSession) => {
        setMessages(session.messages || []);
        setCurrentSessionId(session.sessionId);
        setError(null);
    }, []);

    const removeHistoryItem = useCallback(async (id: string) => {
        const success = await deleteCopilotSession(id);
        if (success) {
            toast.success("Conversación eliminada");
            await fetchHistory();
            setMessages([]);
            setCurrentSessionId(null);
        } else {
            toast.error("No se pudo eliminar la conversación");
        }
        return success;
    }, [fetchHistory]);

    const renameHistoryItem = useCallback(async (id: string, title: string) => {
        const success = await updateCopilotSessionTitle(id, title);
        if (success) {
            toast.success("Conversación renombrada");
            await fetchHistory();
        } else {
            toast.error("No se pudo renombrar la conversación");
        }
        return success;
    }, [fetchHistory]);

    return {
        messages,
        historySessions,
        sendMessage,
        clearMessages,
        restoreSession,
        removeHistoryItem,
        renameHistoryItem,
        isLoading,
        error,
    };
}
