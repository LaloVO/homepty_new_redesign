"use client";

import { useState, useRef, useEffect } from "react";
import { useCopilotAI } from "@/hooks/use-copilot-ai";
import { usePathname } from "next/navigation";
import {
    SendHorizontal,
    Bot,
    User,
    Loader2,
    Trash2,
    History,
    MessageSquare,
    Pencil,
    Check,
    X,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AI Copilot — Connected to Brain LLM (Manus Forge / Gemini)
 * Uses /api/copilot route as server-side proxy to ai.* tRPC endpoints.
 */
export function CopilotAI() {
    const pathname = usePathname();
    const currentModule = pathname.startsWith("/crm")
        ? "crm"
        : pathname.startsWith("/explore")
            ? "explore"
            : pathname.startsWith("/profile")
                ? "profile"
                : "dashboard";

    const { messages, historySessions, sendMessage, clearMessages, restoreSession, removeHistoryItem, renameHistoryItem, isLoading, error } =
        useCopilotAI({ currentModule });

    const [view, setView] = useState<"chat" | "history">("chat");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        sendMessage(input);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestedQuestions = [
        "¿Cuál es el valor promedio de mi portafolio?",
        "¿Qué oportunidades hay en el mercado?",
        "Genera un reporte de mi actividad",
        "¿Cómo puedo mejorar mi ROI?",
    ];

    return (
        <div className="flex flex-col h-full bg-linear-to-b from-background to-muted/20">
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
                        <Sparkles className="text-white w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">AI Copilot</h3>
                        <p className="text-[10px] text-muted-foreground">
                            Manus · Brain v1
                        </p>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* View Toggle */}
                    <button
                        onClick={() => setView(view === "chat" ? "history" : "chat")}
                        className={cn(
                            "p-1.5 rounded-md transition-colors",
                            view === "history"
                                ? "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                        title={view === "chat" ? "Ver historial" : "Volver al chat"}
                    >
                        {view === "chat" ? <History className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    </button>

                    {messages.length > 0 && (
                        <button
                            onClick={clearMessages}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Limpiar conversación activa"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
                {view === "history" ? (
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Historial de Consultas</h4>
                        {historySessions.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-10">
                                Aún no hay historial disponible.
                            </div>
                        ) : (
                            // Historical interactions grouped by session
                            historySessions.map((session) => {
                                const msgs = session.messages || [];
                                if (msgs.length === 0) return null;

                                // Mostrar la primera pregunta del usuario y la respuesta a esa pregunta (o la última)
                                const firstAsstMsg = msgs.find(m => m.role === "assistant");

                                return (
                                    <div
                                        key={`hist-${session.id}`}
                                        className="group space-y-2 border border-border/50 rounded-xl p-4 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer relative"
                                        onClick={() => {
                                            if (editingId === session.id) return;
                                            restoreSession(session);
                                            setView("chat");
                                        }}
                                        title={editingId === session.id ? "" : "Haz clic para reanudar esta conversación"}
                                    >
                                        {/* User Query / Title Row */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex gap-2 flex-1 min-w-0">
                                                <div className="h-6 w-6 rounded-md bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <User className="h-3.5 w-3.5 text-foreground/60" />
                                                </div>
                                                {editingId === session.id ? (
                                                    <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                                                        <input
                                                            autoFocus
                                                            value={editTitle}
                                                            onChange={e => setEditTitle(e.target.value)}
                                                            className="flex-1 bg-background border rounded px-2 py-1 text-sm outline-none focus:border-violet-500 z-10"
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    renameHistoryItem(session.id, editTitle);
                                                                    setEditingId(null);
                                                                } else if (e.key === "Escape") {
                                                                    setEditingId(null);
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={async () => {
                                                                await renameHistoryItem(session.id, editTitle);
                                                                setEditingId(null);
                                                            }}
                                                            className="p-1 text-green-600 hover:bg-green-600/10 rounded"
                                                        ><Check className="h-4 w-4" /></button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1 text-red-600 hover:bg-red-600/10 rounded"
                                                        ><X className="h-4 w-4" /></button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            {editingId !== session.id && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingId(session.id);
                                                            setEditTitle(session.title);
                                                        }}
                                                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors"
                                                        title="Editar título"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm("¿Estás seguro de eliminar esta conversación del historial?")) {
                                                                await removeHistoryItem(session.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                        title="Eliminar historial"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Assistant Answer Preview */}
                                        {firstAsstMsg && (
                                            <div className="flex gap-2 pt-2 border-t border-border/50 mt-2">
                                                <div className="h-6 w-6 rounded-md bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Bot className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-4">
                                                    {firstAsstMsg.content}
                                                </p>
                                            </div>
                                        )}
                                        <div className="text-[10px] text-muted-foreground/60 text-right mt-2">
                                            {msgs.length} interacciones • {new Date(session.updatedAt).toLocaleString("es-MX", {
                                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : messages.length === 0 ? (
                    /* Welcome / empty state */
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="text-violet-600 w-4 h-4" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">
                                Hola, soy tu copiloto inmobiliario
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pregúntame sobre tu portafolio, mercado, o valuaciones
                            </p>
                        </div>
                        <div className="grid gap-2 w-full max-w-[280px]">
                            {suggestedQuestions.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    disabled={isLoading}
                                    className="text-left text-xs px-3 py-2 rounded-lg border border-muted-foreground/10 hover:bg-muted/50 hover:border-violet-500/20 transition-all text-muted-foreground hover:text-foreground"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Messages list */
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === "user" && "flex-row-reverse"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden",
                                    msg.role === "assistant"
                                        ? "bg-white border border-gray-200"
                                        : "bg-slate-200 border border-white"
                                )}>
                                    {msg.role === "assistant" ? (
                                        <Bot className="text-violet-600 w-4 h-4" />
                                    ) : (
                                        <div className="bg-slate-300 w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                            E
                                        </div>
                                    )}
                                </div>
                                <div className={cn(
                                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/60 border border-border/50"
                                )}>
                                    {msg.role === "assistant" && !msg.isComplete ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span className="text-xs">Procesando...</span>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap leading-relaxed">
                                            {msg.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Error indicator */}
                {error && (
                    <div className="text-center">
                        <p className="text-[10px] text-destructive bg-destructive/10 px-3 py-1 rounded-full inline-block">
                            {error}
                        </p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-linear-to-r from-violet-600 to-indigo-600 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur-sm"></div>
                    <div className="relative flex items-center bg-gray-50 rounded-xl shadow-inner overflow-hidden border border-gray-200 focus-within:bg-white focus-within:ring-0 transition-colors">
                        <div className="pl-3 text-violet-600">
                            <Sparkles size={18} />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Pregunta algo..."
                            disabled={isLoading}
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                input.trim() && !isLoading
                                    ? "bg-violet-500 text-white hover:bg-violet-600"
                                    : "text-muted-foreground/40"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <SendHorizontal className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 text-center mt-1.5">
                        Powered by Homepty Brain · Manus Forge · Gemini
                    </p>
                </div>
            </div>
        </div>
    );
}