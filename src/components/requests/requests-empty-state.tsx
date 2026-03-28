"use client";

import { ArrowRightIcon, LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RequestsEmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[500px]">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] right-[15%] w-64 h-64 bg-blue-200/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[20%] left-[15%] w-64 h-64 bg-purple-200/20 rounded-full blur-[100px] animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Animated Central Element */}
                <div className="relative w-64 h-64 mb-8 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />

                    <div className="absolute inset-0 border-[0.5px] border-white/40 bg-white/10 backdrop-blur-sm rounded-3xl transform rotate-3 flex items-center justify-center shadow-2xl animate-in fade-in zoom-in duration-700">
                        <div className="w-48 h-56 bg-white/20 border border-white/50 rounded-xl shadow-inner flex flex-col p-4 relative overflow-hidden">
                            <div className="h-2 w-1/3 bg-white/40 rounded mb-4" />
                            <div className="h-2 w-full bg-white/30 rounded mb-2" />
                            <div className="h-2 w-5/6 bg-white/30 rounded mb-2" />
                            <div className="h-2 w-4/6 bg-white/30 rounded" />

                            <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                            </div>
                        </div>
                    </div>

                    {/* Floating Badges */}
                    <div className="absolute -top-4 -right-8 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/60 shadow-lg transform rotate-6 animate-bounce" style={{ animationDuration: "3s" }}>
                        <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider">0 Solicitudes</span>
                    </div>

                    <div className="absolute -bottom-2 -left-6 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/60 shadow-lg transform -rotate-3 animate-bounce" style={{ animationDuration: "4s" }}>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            <span className="text-[10px] font-mono text-slate-600 font-medium">Sistema Listo</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight font-display">
                        No hay solicitudes activas
                    </h2>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-sans">
                        El sistema neural está listo para procesar nuevos requerimientos.
                        Comienza una nueva solicitud para activar el motor de búsqueda.
                    </p>

                    <Button
                        className="group relative px-8 py-6 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-semibold shadow-xl border border-white/60 transition-all overflow-hidden"
                        variant="outline"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative flex items-center gap-2">
                            Iniciar nueva solicitud
                            <ArrowRightIcon className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                </div>
            </div>

            {/* AI Suggestion Card */}
            <div className="absolute bottom-8 right-8 z-20 animate-in fade-in slide-in-from-right-8 duration-700 delay-500">
                <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 max-w-sm cursor-pointer hover:-translate-y-1 transition-transform group border border-white/40 shadow-xl bg-white/60 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <LightbulbIcon size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Sugerencia AI</div>
                        <div className="text-xs font-medium text-slate-700">Las tendencias muestran +12% de demanda en Zona Centro.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
