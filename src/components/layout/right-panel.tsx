"use client";
import {
    MoreHorizontalIcon,
    BellIcon,
    SparklesIcon,
} from "lucide-react";

export function RightPanel() {
    return (
        <aside className="h-full w-full bg-transparent border-none overflow-hidden flex flex-col relative z-0 shrink-0">
            <div className="p-5 border-none flex items-center justify-between">
                <h2 className="font-bold text-slate-800">Actividad Reciente</h2>
                <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                        <BellIcon size={18} />
                    </button>
                    <button className="text-slate-400 hover:text-primary transition-colors">
                        <MoreHorizontalIcon size={18} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                            Agenda Hoy
                        </span>
                        <span className="text-xs font-semibold text-primary cursor-pointer">
                            Ver todo
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex gap-3 items-start group">
                            <div className="flex flex-col items-center min-w-[36px]">
                                <span className="text-[10px] font-bold text-slate-400">
                                    10:00
                                </span>
                                <div className="w-0.5 h-full bg-slate-100 mt-1 mb-1 group-last:hidden"></div>
                            </div>
                            <div className="flex-1 bg-blue-50/50 hover:bg-blue-50 p-2 rounded-lg border border-transparent hover:border-blue-100 transition-colors cursor-pointer">
                                <h4 className="text-xs font-bold text-slate-800">
                                    Visita: Casa Sur
                                </h4>
                                <p className="text-[10px] text-slate-500">Cliente: Marco R.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start group">
                            <div className="flex flex-col items-center min-w-[36px]">
                                <span className="text-[10px] font-bold text-slate-400">
                                    14:30
                                </span>
                                <div className="w-0.5 h-full bg-slate-100 mt-1 mb-1 group-last:hidden"></div>
                            </div>
                            <div className="flex-1 bg-purple-50/50 hover:bg-purple-50 p-2 rounded-lg border border-transparent hover:border-purple-100 transition-colors cursor-pointer">
                                <h4 className="text-xs font-bold text-slate-800">
                                    Firma Contrato
                                </h4>
                                <p className="text-[10px] text-slate-500">Notaría #5</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon size={18} className="text-primary" />
                        <span className="text-xs font-bold text-slate-800 uppercase">
                            AI Insights
                        </span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                        <h4 className="font-bold text-sm mb-1 relative z-10">
                            Oportunidad Detectada
                        </h4>
                        <p className="text-xs text-white/80 leading-relaxed relative z-10 mb-3">
                            El sector norte muestra un incremento del 4% en plusvalía esta
                            semana. Revisa las propiedades pendientes.
                        </p>
                        <button className="w-full py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-semibold transition-colors border border-white/10">
                            Ver Análisis
                        </button>
                    </div>
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase mb-3 block">
                        Nuevos Leads
                    </span>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs ring-2 ring-white">
                                SA
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800">
                                    Sofia Alvarez
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    Interesada en Loft Centro
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs ring-2 ring-white">
                                JR
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800">
                                    Jorge Ramos
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    Busca inversión &gt; $2M
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
