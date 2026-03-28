"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getRecentActivity, type RecentActivity } from "@/server/queries/get-user-activity";
import { getUserAIStats, type UserAIStats } from "@/server/queries/get-user-ai-stats";

// Activity display helpers
const ACTIVITY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    copilot_session: { label: "Consulta Copilot", icon: "💬", color: "bg-purple-50 text-purple-600" },
    estimacion_valor: { label: "Estimación de valor", icon: "📊", color: "bg-blue-50 text-blue-600" },
    vista_propiedad: { label: "Vista de propiedad", icon: "🏠", color: "bg-green-50 text-green-600" },
    calendar_event: { label: "Evento calendario", icon: "📅", color: "bg-orange-50 text-orange-600" },
};

function getActivityDisplay(activity: RecentActivity) {
    const config = ACTIVITY_CONFIG[activity.tipo_actividad] ?? {
        label: activity.tipo_actividad,
        icon: "📌",
        color: "bg-gray-50 text-gray-600",
    };
    return config;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
}

export function ProfileStats() {
    const [aiStats, setAiStats] = useState<UserAIStats | null>(null);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [stats, recent] = await Promise.all([
                    getUserAIStats(),
                    getRecentActivity(5),
                ]);
                setAiStats(stats);
                setActivities(recent);
            } catch (err) {
                console.warn("[ProfileStats] Failed to load data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const score = aiStats?.aiScore ?? 0;
    const scoreRatio = score / 100;
    const circumference = 263.89;

    return (
        <div className="flex flex-col gap-y-5 h-full overflow-y-auto pb-4 scrollbar-hide">
            {/* AI Score Section */}
            <div className="bg-white rounded-2xl p-4 relative overflow-hidden border border-gray-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="text-[10px] font-bold text-gray-800 tracking-tight uppercase">AI Stats</h3>
                    </div>
                    {score >= 70 && (
                        <span className="bg-green-50 text-green-600 text-[8px] px-1.5 py-0.5 rounded font-bold border border-green-100 uppercase tracking-wider">
                            {score >= 90 ? "Top 5%" : score >= 80 ? "Top 15%" : "Activo"}
                        </span>
                    )}
                </div>

                <div className="flex flex-col items-center py-2">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                            <circle
                                cx="48" cy="48" r="42"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={loading ? circumference : circumference * (1 - scoreRatio)}
                                strokeLinecap="round"
                                className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-gray-900 leading-none">
                                {loading ? "—" : score}
                            </span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Score</span>
                        </div>
                    </div>
                    <p className="mt-3 text-center text-[10px] text-gray-400 max-w-[160px] font-medium leading-relaxed">
                        {loading
                            ? "Calculando..."
                            : score >= 80
                                ? "Tu perfil tiene una optimización neural excelente."
                                : score >= 50
                                    ? "Tu perfil tiene buena actividad. ¡Sigue así!"
                                    : "Usa el Copilot y herramientas AI para mejorar tu score."}
                    </p>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-600 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-green-500" />
                                Consultas Copilot (30d)
                            </span>
                            <span className="text-gray-900">{loading ? "—" : aiStats?.totalCopilotQueries ?? 0}</span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                style={{ width: loading ? "0%" : `${Math.min(100, (aiStats?.totalCopilotQueries ?? 0) * 5)}%` }}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-600 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                                Estimaciones (30d)
                            </span>
                            <span className="text-gray-900">{loading ? "—" : aiStats?.totalEstimations ?? 0}</span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: loading ? "0%" : `${Math.min(100, (aiStats?.totalEstimations ?? 0) * 10)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/60 shadow-sm">
                <h3 className="text-[10px] font-bold text-gray-800 mb-3 uppercase tracking-tight">Insignias Neurales</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        {
                            icon: "🏅", label: "Super Seller",
                            color: "bg-orange-50 text-orange-600 border-orange-100",
                            earned: (aiStats?.totalEstimations ?? 0) >= 5,
                        },
                        {
                            icon: "🚀", label: "Rising Star",
                            color: "bg-blue-50 text-blue-600 border-blue-100",
                            earned: (aiStats?.activeDaysLast30 ?? 0) >= 10,
                        },
                        {
                            icon: "💬", label: "Fast Reply",
                            color: "bg-purple-50 text-purple-600 border-purple-100",
                            earned: (aiStats?.totalCopilotQueries ?? 0) >= 10,
                        },
                        {
                            icon: "⭐", label: "AI Master",
                            color: "bg-gray-50 text-gray-300 border-gray-100 border-dashed",
                            earned: (aiStats?.aiScore ?? 0) >= 90,
                        },
                    ].map((badge, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl border transition-all hover:scale-105",
                                badge.earned ? badge.color : "bg-gray-50 text-gray-300 border-gray-100 border-dashed"
                            )}
                        >
                            <span className={cn("text-lg mb-1", !badge.earned && "grayscale opacity-40")}>{badge.icon}</span>
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
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-2 animate-pulse">
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 shrink-0" />
                                    <div className="flex flex-col gap-1 flex-1">
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                        <div className="h-2 bg-gray-100 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length === 0 ? (
                        <p className="text-[10px] text-gray-400 text-center py-4 font-medium">
                            Sin actividad reciente
                        </p>
                    ) : (
                        activities.map((activity) => {
                            const display = getActivityDisplay(activity);
                            const meta = activity.metadata as Record<string, unknown> | null;
                            const target = meta?.direccion as string || meta?.title as string || "";
                            return (
                                <div key={activity.id} className="flex gap-2 group cursor-pointer transition-all">
                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border border-transparent group-hover:border-current/20 transition-all", display.color)}>
                                        {display.icon}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-[10px] leading-tight text-gray-600 font-medium">
                                            <span className="text-gray-900 font-bold">{display.label}</span>{" "}
                                            {target && <span className="text-primary font-bold">{target}</span>}
                                        </p>
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {timeAgo(activity.created_at!)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
