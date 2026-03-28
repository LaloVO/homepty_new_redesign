import { Plug2 } from "lucide-react";
import {
    getIntegrationStatusAction,
    getSyncHistoryAction,
} from "@/server/actions/easybroker";
import { EasyBrokerPageClient } from "./easybroker-page-client";

export const metadata = {
    title: "Integración EasyBroker — Homepty",
    description: "Importa y sincroniza tu inventario desde EasyBroker CRM",
};

export default async function EasyBrokerSettingsPage() {
    const [integrationRes, historyRes] = await Promise.all([
        getIntegrationStatusAction(),
        getSyncHistoryAction(),
    ]);

    return (
        <div className="flex-1 overflow-auto p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Plug2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">EasyBroker CRM</h1>
                    <p className="text-sm text-gray-500">
                        Sincroniza tu inventario de propiedades automáticamente
                    </p>
                </div>
            </div>

            {/* Contenido cliente (necesita interactividad) */}
            <EasyBrokerPageClient
                initialIntegration={integrationRes.ok ? integrationRes.data ?? null : null}
                initialLogs={historyRes.ok ? historyRes.data ?? [] : []}
            />
        </div>
    );
}
