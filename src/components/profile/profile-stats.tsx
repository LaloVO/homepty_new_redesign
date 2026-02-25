"use client";

import { cn } from "@/lib/utils";

export function ProfileStats() {
    return (
        <div className="flex flex-col gap-y-5 h-full overflow-y-auto pb-4 scrollbar-hide">
            {/* AI Score Section */}
            <div className="bg-white rounded-2xl p-4 relative overflow-hidden border border-gray-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="text-[10px] font-bold text-gray-800 tracking-tight uppercase">AI Stats</h3>
                    </div>
                    <span className="bg-green-50 text-green-600 text-[8px] px-1.5 py-0.5 rounded font-bold border border-green-100 uppercase tracking-wider">
                        Top 5%
                    </span>
                </div>

                <div className="flex flex-col items-center py-2">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="42"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="42"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={263.89}
                                strokeDashoffset={263.89 * (1 - 0.92)}
                                strokeLinecap="round"
                                className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-gray-900 leading-none">92</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Score</span>
                        </div>
                    </div>
                    <p className="mt-3 text-center text-[10px] text-gray-400 max-w-[160px] font-medium leading-relaxed">
                        Tu perfil tiene una optimización neural excelente.
                    </p>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-600 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-green-500" />
                                Velocidad de Respuesta
                            </span>
                            <span className="text-gray-900">98%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full w-[98%] transition-all duration-1000" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-600 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                                Cierre de Tratos
                            </span>
                            <span className="text-gray-900">85%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full w-[85%] transition-all duration-1000" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/60 shadow-sm">
                <h3 className="text-[10px] font-bold text-gray-800 mb-3 uppercase tracking-tight">Insignias Neurales</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { icon: "🏅", label: "Super Seller", color: "bg-orange-50 text-orange-600 border-orange-100" },
                        { icon: "🚀", label: "Rising Star", color: "bg-blue-50 text-blue-600 border-blue-100" },
                        { icon: "💬", label: "Fast Reply", color: "bg-purple-50 text-purple-600 border-purple-100" },
                        { icon: "⭐", label: "AI Master", color: "bg-gray-50 text-gray-300 border-gray-100 border-dashed" },
                    ].map((badge, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl border transition-all hover:scale-105",
                                badge.color
                            )}
                        >
                            <span className="text-lg mb-1">{badge.icon}</span>
                            <span className="text-[7px] font-bold text-center uppercase tracking-tighter leading-none">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/60 shadow-sm flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-tight">Actividad Reciente</h3>
                    <button className="text-primary text-[9px] font-bold hover:underline uppercase tracking-tighter">Ver todo</button>
                </div>
                <div className="space-y-3 overflow-y-auto pr-1 scrollbar-hide">
                    {[
                        {
                            type: "Visit",
                            user: "Eduardo",
                            action: "agendó una visita para",
                            target: "Casa Moderna Sur",
                            time: "Hace 10 min",
                            icon: "bg-blue-50 text-blue-600",
                            initial: "EV",
                        },
                        {
                            type: "Offer",
                            user: "Nueva oferta",
                            action: "recibida en",
                            target: "Loft Industrial",
                            time: "Hace 2 horas",
                            icon: "bg-green-50 text-green-600",
                            initial: "$",
                        },
                        {
                            type: "Optimized",
                            user: "AI optimizó",
                            action: "la descripción de 3 propiedades",
                            target: "",
                            time: "Hace 5 horas",
                            icon: "bg-purple-50 text-purple-600",
                            initial: "🪄",
                        },
                    ].map((activity, idx) => (
                        <div key={idx} className="flex gap-2 group cursor-pointer transition-all">
                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border border-transparent group-hover:border-current/20 transition-all", activity.icon)}>
                                {activity.initial}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] leading-tight text-gray-600 font-medium">
                                    <span className="text-gray-900 font-bold">{activity.user}</span> {activity.action}{" "}
                                    {activity.target && <span className="text-primary font-bold">{activity.target}</span>}
                                </p>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
