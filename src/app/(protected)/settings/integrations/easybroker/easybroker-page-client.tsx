"use client";
import { useState, useCallback } from "react";
import { EasyBrokerConfigCard } from "@/components/integrations/easybroker-config-card";
import { SyncControl } from "@/components/integrations/sync-control";
import { SyncHistory } from "@/components/integrations/sync-history";
import {
    getIntegrationStatusAction,
    getSyncHistoryAction,
    type EasyBrokerIntegration,
    type EasyBrokerSyncLog,
} from "@/server/actions/easybroker";

interface Props {
    initialIntegration: EasyBrokerIntegration | null;
    initialLogs: EasyBrokerSyncLog[];
}

export function EasyBrokerPageClient({ initialIntegration, initialLogs }: Props) {
    const [integration, setIntegration] = useState(initialIntegration);
    const [logs, setLogs] = useState(initialLogs);

    // Refrescar datos desde el servidor
    const refresh = useCallback(async () => {
        const [integrationRes, historyRes] = await Promise.all([
            getIntegrationStatusAction(),
            getSyncHistoryAction(),
        ]);
        if (integrationRes.ok) setIntegration(integrationRes.data ?? null);
        if (historyRes.ok) setLogs(historyRes.data ?? []);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            {/* Columna izquierda: Configuración + Sync */}
            <div className="space-y-6">
                <EasyBrokerConfigCard integration={integration} onUpdate={refresh} />
                {integration && (
                    <SyncControl integration={integration} onSync={refresh} />
                )}
            </div>

            {/* Columna derecha: Historial */}
            <div>
                <SyncHistory logs={logs} />
            </div>
        </div>
    );
}
