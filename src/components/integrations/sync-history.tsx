"use client";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { type EasyBrokerSyncLog } from "@/server/actions/easybroker";

interface Props {
    logs: EasyBrokerSyncLog[];
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function duration(start: string, end: string | null) {
    if (!end) return "—";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const secs = Math.round(ms / 1000);
    return secs < 60 ? `${secs}s` : `${Math.round(secs / 60)}min`;
}

export function SyncHistory({ logs }: Props) {
    if (logs.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                    Historial de sincronizaciones
                </h3>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Aún no hay sincronizaciones</p>
                    <p className="text-xs text-gray-400">
                        Haz tu primera sincronización manual arriba
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Historial de sincronizaciones
            </h3>

            <div className="space-y-2">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        {/* Ícono de estado */}
                        <div className="shrink-0">
                            {log.status === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : log.status === "error" ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            )}
                        </div>

                        {/* Fecha */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">
                                {formatDate(log.sync_started_at)}
                            </p>
                            <p className="text-xs text-gray-400">
                                Duración: {duration(log.sync_started_at, log.sync_completed_at)}
                            </p>
                        </div>

                        {/* Contadores */}
                        <div className="flex items-center gap-3 text-xs shrink-0">
                            <span className="text-emerald-600 font-medium">
                                +{log.properties_added}
                            </span>
                            <span className="text-blue-600 font-medium">
                                ↻{log.properties_updated}
                            </span>
                            {log.properties_failed > 0 && (
                                <span className="text-red-500 font-medium">
                                    ✕{log.properties_failed}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
                Se muestran las últimas 10 sincronizaciones •{" "}
                <span className="text-emerald-600">+añadidas</span>{" "}
                <span className="text-blue-600">↻actualizadas</span>{" "}
                <span className="text-red-500">✕fallidas</span>
            </p>
        </div>
    );
}
