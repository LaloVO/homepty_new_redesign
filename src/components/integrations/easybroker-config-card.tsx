"use client";
import { useState, useTransition } from "react";
import { KeyRound, CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import {
    saveEasyBrokerTokenAction,
    testEasyBrokerConnectionAction,
    toggleIntegrationAction,
    type EasyBrokerIntegration,
} from "@/server/actions/easybroker";

interface Props {
    integration: EasyBrokerIntegration | null;
    onUpdate: () => void;
}

export function EasyBrokerConfigCard({ integration, onUpdate }: Props) {
    const [apiKey, setApiKey] = useState(
        integration ? "••••••••••••••••••••" : ""
    );
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        if (!apiKey || apiKey.startsWith("•")) return;
        startTransition(async () => {
            const res = await saveEasyBrokerTokenAction({ apiKey });
            setStatus(res.ok ? "success" : "error");
            setMessage(res.message);
            if (res.ok) onUpdate();
        });
    };

    const handleTest = () => {
        startTransition(async () => {
            setMessage("Probando conexión...");
            const res = await testEasyBrokerConnectionAction();
            setStatus(res.ok ? "success" : "error");
            if (res.ok && res.data) {
                setMessage(`${res.message} — ${res.data.properties_count} propiedades encontradas.`);
            } else {
                setMessage(res.message);
            }
        });
    };

    const handleToggle = () => {
        startTransition(async () => {
            const res = await toggleIntegrationAction({
                isActive: !integration?.is_active,
            });
            setStatus(res.ok ? "success" : "error");
            setMessage(res.message);
            if (res.ok) onUpdate();
        });
    };

    const isConnected = !!integration;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">
                            API Key de EasyBroker
                        </h3>
                        <p className="text-xs text-gray-500">
                            Encuéntrala en EasyBroker → Configuración → Integraciones
                        </p>
                    </div>
                </div>

                {/* Badge de estado */}
                <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isConnected && integration.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isConnected && !integration.is_active
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${isConnected && integration.is_active
                                ? "bg-emerald-500"
                                : isConnected
                                    ? "bg-amber-500"
                                    : "bg-gray-400"
                            }`}
                    />
                    {isConnected && integration.is_active
                        ? "Conectado"
                        : isConnected
                            ? "Pausado"
                            : "Sin configurar"}
                </span>
            </div>

            {/* Input API Key */}
            <div className="relative mb-4">
                <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Pega aquí tu API Key de EasyBroker"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            {/* Mensaje de estado */}
            {message && (
                <div
                    className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 mb-4 ${status === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                >
                    {status === "success" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    {message}
                </div>
            )}

            {/* Botones */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={handleSave}
                    disabled={isPending || !apiKey || apiKey.startsWith("•")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Guardar token
                </button>

                {isConnected && (
                    <>
                        <button
                            onClick={handleTest}
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            Probar conexión
                        </button>
                        <button
                            onClick={handleToggle}
                            disabled={isPending}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl disabled:opacity-50 transition-colors ${integration.is_active
                                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                }`}
                        >
                            {integration.is_active ? "Pausar" : "Activar"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
