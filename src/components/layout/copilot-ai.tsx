"use client";

import { useState } from "react";
import {
    SparklesIcon,
    XIcon,
    BotIcon,
    MicIcon,
    ArrowUpIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export function CopilotAI() {
    const [input, setInput] = useState("");

    // Dummy messages for initial layout as per the HTML fragment
    const messages: Message[] = [
        {
            id: "1",
            role: "assistant",
            content: "Hola Eduardo. He analizado el mercado y detecté 3 propiedades subvaluadas en Zona Sur que coinciden con los criterios de Mariana Rodríguez. ¿Te gustaría ver el reporte?",
            timestamp: "Hoy"
        },
        {
            id: "2",
            role: "user",
            content: "Sí, muéstrame el ROI estimado para cada una.",
            timestamp: "Hoy"
        },
        {
            id: "3",
            role: "assistant",
            content: "Aquí tienes el desglose de rentabilidad proyectada a 5 años:",
            timestamp: "Hoy"
        }
    ];

    return (
        <aside className="h-full w-full bg-transparent border-none overflow-hidden flex flex-col relative z-0 shrink-0">
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
                        <SparklesIcon className="text-white w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">AI Copilot</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">Online • v4.2</span>
                        </div>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100/50 transition-colors">
                    <XIcon size={20} />
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-50/30">
                <div className="flex items-center justify-center my-4">
                    <span className="text-[10px] bg-white/50 text-gray-400 px-2 py-0.5 rounded-full border border-slate-100">Hoy</span>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-3",
                            msg.role === "user" ? "flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mt-1 overflow-hidden",
                            msg.role === "assistant" ? "bg-white border border-gray-200" : "bg-slate-200 border border-white"
                        )}>
                            {msg.role === "assistant" ? (
                                <BotIcon className="text-violet-600 w-4 h-4" />
                            ) : (
                                <div className="bg-slate-300 w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                    E
                                </div>
                            )}
                        </div>
                        <div className={cn(
                            "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm border transition-all",
                            msg.role === "assistant"
                                ? "bg-white rounded-tl-none border-gray-100 text-slate-700"
                                : "bg-violet-600 rounded-tr-none border-violet-500 text-white shadow-violet-100"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Example Property Card in Chat */}
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                        <BotIcon className="text-violet-600 w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-2 max-w-[85%]">
                        <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 relative overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-800">Casa Moderna Sur</div>
                                    <div className="flex gap-1 mt-0.5">
                                        <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                            ROI: 14.2%
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                            5Y
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1 mb-3">
                                <div className="flex justify-between text-[10px] text-gray-500">
                                    <span>Valor actual</span>
                                    <span className="font-medium text-gray-700">$240,000</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500">
                                    <span>Proyección 2029</span>
                                    <span className="font-medium text-gray-700">$315,000</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-3">
                                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full w-[85%]"></div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 text-[10px] py-1.5 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors font-medium text-gray-600">Detalles</button>
                                <button className="flex-1 text-[10px] py-1.5 bg-violet-600/10 text-violet-600 border border-violet-100 rounded hover:bg-violet-600/20 transition-colors font-medium">Agendar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur-sm"></div>
                    <div className="relative flex items-center bg-gray-50 rounded-xl shadow-inner overflow-hidden border border-gray-200 focus-within:bg-white focus-within:ring-0 transition-colors">
                        <div className="pl-3 text-violet-600">
                            <SparklesIcon size={18} />
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe a Copilot..."
                            className="w-full py-3 px-3 text-sm text-gray-700 placeholder-gray-400 border-none focus:ring-0 bg-transparent"
                        />
                        <button className="p-2 mr-1 rounded-lg text-gray-400 hover:text-violet-600 transition-colors">
                            <MicIcon size={18} />
                        </button>
                        <button className="p-2 mr-1 bg-white text-violet-600 border border-gray-100 rounded-lg hover:bg-violet-600 hover:text-white transition-all shadow-sm">
                            <ArrowUpIcon size={18} />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-2">
                    AI Neural puede cometer errores. Verifica la info.
                </p>
            </div>
        </aside>
    );
}
