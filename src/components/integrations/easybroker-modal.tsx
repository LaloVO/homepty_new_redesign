"use client";
import { useState, useCallback, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plug2, KeyRound, RefreshCw, Clock, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Building2, X } from "lucide-react";
import {
    saveEasyBrokerTokenAction,
    testEasyBrokerConnectionAction,
    triggerSyncAction,
    toggleIntegrationAction,
    getIntegrationStatusAction,
    getSyncHistoryAction,
    type EasyBrokerIntegration,
    type EasyBrokerSyncLog,
} from "@/server/actions/easybroker";

// ─── Helpers ────────────────────────────────────────────────
function formatDate(dateStr: string | null) {
    if (!dateStr) return "Nunca";
    return new Date(dateStr).toLocaleString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function syncDuration(start: string, end: string | null) {
    if (!end) return "—";
    const secs = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
    return secs < 60 ? `${secs}s` : `${Math.round(secs / 60)}min`;
}

// ─── Props del modal ─────────────────────────────────────────
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EasyBrokerModal({ open, onOpenChange }: Props) {
    const [integration, setIntegration] = useState<EasyBrokerIntegration | null>(null);
    const [logs, setLogs] = useState<EasyBrokerSyncLog[]>([]);
    const [loaded, setLoaded] = useState(false);

    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [isPending, startTransition] = useTransition();

    // Cargar datos cada vez que abre el modal
    const handleOpen = useCallback(async (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            // Reset state on close so next open always re-fetches
            setLoaded(false);
            setMsg(null);
            return;
        }
        // Always fetch fresh data on open
        setLoaded(false);
        const [intRes, logRes] = await Promise.all([
            getIntegrationStatusAction(),
            getSyncHistoryAction(),
        ]);
        if (intRes.ok) setIntegration(intRes.data ?? null);
        if (logRes.ok) setLogs(logRes.data ?? []);
        // Show masked key placeholder if token exists
        if (intRes.ok && intRes.data?.api_key) {
            setApiKey("••••••••••••••••••••");
        } else {
            setApiKey("");
        }
        setLoaded(true);
    }, [onOpenChange]);

    const refresh = useCallback(async () => {
        const [intRes, logRes] = await Promise.all([
            getIntegrationStatusAction(),
            getSyncHistoryAction(),
        ]);
        if (intRes.ok) setIntegration(intRes.data ?? null);
        if (logRes.ok) setLogs(logRes.data ?? []);
    }, []);

    // ── Acciones ──────────────────────────────────────────────
    const handleSave = () => {
        if (!apiKey || apiKey.startsWith("•")) return;
        startTransition(async () => {
            const res = await saveEasyBrokerTokenAction({ apiKey });
            setMsg({ text: res.message, ok: res.ok });
            if (res.ok) { await refresh(); setApiKey("••••••••••••••••••••"); }
        });
    };

    const handleTest = () => {
        startTransition(async () => {
            setMsg({ text: "Probando conexión…", ok: true });
            const res = await testEasyBrokerConnectionAction();
            setMsg({
                text: res.ok && res.data
                    ? `${res.message} (${res.data.properties_count} propiedades)`
                    : res.message,
                ok: res.ok,
            });
        });
    };

    const handleSync = () => {
        setMsg(null);
        startTransition(async () => {
            const res = await triggerSyncAction();
            setMsg({ text: res.message, ok: res.ok });
            if (res.ok) await refresh();
        });
    };

    const handleToggle = () => {
        startTransition(async () => {
            const res = await toggleIntegrationAction({ isActive: !integration?.is_active });
            setMsg({ text: res.message, ok: res.ok });
            if (res.ok) await refresh();
        });
    };

    const isConnected = !!integration;
    const statusColor = {
        success: "text-emerald-600", error: "text-red-500", pending: "text-amber-500",
    }[integration?.last_sync_status ?? "pending"];

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogContent className="w-full md:max-w-2xl max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <Plug2 className="w-4 h-4 text-white" />
                        </div>
                        EasyBroker CRM
                    </DialogTitle>
                    <DialogDescription>
                        Conecta y sincroniza tu inventario de propiedades desde EasyBroker
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* ── Mensaje de estado ── */}
                    {msg && (
                        <div className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2.5 ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {msg.ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                            <span className="flex-1">{msg.text}</span>
                            <button onClick={() => setMsg(null)}><X className="w-3 h-3" /></button>
                        </div>
                    )}

                    {/* ── Sección API Key ── */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">API Key</span>
                            </div>
                            {/* Badge estado */}
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${isConnected && integration.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isConnected ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-gray-100 text-gray-500 border-gray-200"
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected && integration.is_active ? "bg-emerald-500" : isConnected ? "bg-amber-500" : "bg-gray-400"}`} />
                                {isConnected && integration.is_active ? "Conectado" : isConnected ? "Pausado" : "Sin configurar"}
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Pega aquí tu API Key de EasyBroker"
                                className="w-full px-3 py-2 pr-9 border border-gray-200 bg-white rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={handleSave}
                                disabled={isPending || !apiKey || apiKey.startsWith("•")}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                Guardar
                            </button>
                            {isConnected && (
                                <>
                                    <button
                                        onClick={handleTest}
                                        disabled={isPending}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                    >
                                        Probar conexión
                                    </button>
                                    <button
                                        onClick={handleToggle}
                                        disabled={isPending}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors border ${integration.is_active
                                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                            }`}
                                    >
                                        {integration.is_active ? "Pausar" : "Activar"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Sección Sync (solo si está conectado) ── */}
                    {isConnected && (
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Sincronización</span>
                                </div>
                                <button
                                    onClick={handleSync}
                                    disabled={isPending || !integration.is_active}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                    Sincronizar ahora
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white rounded-xl p-3 border border-gray-100">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">Última sync</span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700">{formatDate(integration.last_sync_at)}</p>
                                    <span className={`text-xs font-medium ${statusColor}`}>
                                        {integration.last_sync_status === "success" ? "Exitosa" : integration.last_sync_status === "error" ? "Con errores" : "Pendiente"}
                                    </span>
                                </div>
                                <div className="bg-white rounded-xl p-3 border border-gray-100">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Building2 className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">Sincronizadas</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-800">{integration.properties_synced_count}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Historial ── */}
                    {isConnected && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Últimas sincronizaciones</p>
                            {logs.length === 0 ? (
                                <div className="flex items-center justify-center py-6 text-center">
                                    <div>
                                        <Clock className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400">Aún no hay sincronizaciones</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {logs.slice(0, 5).map((log) => (
                                        <div key={log.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
                                            {log.status === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : log.status === "error" ? <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" /> : <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />}
                                            <p className="text-xs text-gray-600 flex-1">{formatDate(log.sync_started_at)} · {syncDuration(log.sync_started_at, log.sync_completed_at)}</p>
                                            <div className="flex gap-2 text-xs shrink-0">
                                                <span className="text-emerald-600 font-medium">+{log.properties_added}</span>
                                                <span className="text-blue-600 font-medium">↻{log.properties_updated}</span>
                                                {log.properties_failed > 0 && <span className="text-red-500 font-medium">✕{log.properties_failed}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
