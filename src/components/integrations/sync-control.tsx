"use client";
import { useState, useTransition } from "react";
import {
    RefreshCw,
    Clock,
    Building2,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";
import { triggerSyncAction, type EasyBrokerIntegration } from "@/server/actions/easybroker";

interface Props {
    integration: EasyBrokerIntegration;
    onSync: () => void;
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "Nunca";
    return new Date(dateStr).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function SyncControl({ integration, onSync }: Props) {
    const [result, setResult] = useState<{
        ok: boolean;
        message: string;
    } | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSync = () => {
        setResult(null);
        startTransition(async () => {
            const res = await triggerSyncAction();
            setResult({ ok: res.ok, message: res.message });
            if (res.ok) onSync();
        });
    };

    const statusColor = {
        success: "text-emerald-600",
        error: "text-red-500",
        pending: "text-amber-500",
    }[integration.last_sync_status];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                        Sincronización de propiedades
                    </h3>
                    <p className="text-xs text-gray-500">
                        Importa y actualiza tu inventario desde EasyBroker
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">Última sincronización</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                        {formatDate(integration.last_sync_at)}
                    </p>
                    <span className={`text-xs font-medium ${statusColor}`}>
                        {integration.last_sync_status === "success"
                            ? "Exitosa"
                            : integration.last_sync_status === "error"
                                ? "Con errores"
                                : "Pendiente"}
                    </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">Propiedades sincronizadas</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        {integration.properties_synced_count}
                    </p>
                </div>
            </div>

            {/* Error message */}
            {integration.error_message && (
                <div className="flex items-start gap-2 text-xs bg-red-50 text-red-600 rounded-lg px-3 py-2 mb-4">
                    <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{integration.error_message}</span>
                </div>
            )}

            {/* Resultado del último sync manual */}
            {result && (
                <div
                    className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 mb-4 ${result.ok
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                >
                    {result.ok ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    {result.message}
                </div>
            )}

            <button
                onClick={handleSync}
                disabled={isPending || !integration.is_active}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sincronizando…
                    </>
                ) : (
                    <>
                        <RefreshCw className="w-4 h-4" />
                        Sincronizar ahora
                    </>
                )}
            </button>

            {!integration.is_active && (
                <p className="text-center text-xs text-gray-400 mt-2">
                    Activa la integración para sincronizar
                </p>
            )}
        </div>
    );
}
