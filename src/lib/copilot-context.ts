import type { CopilotContext } from "@/lib/brain-types";
import type { User, Property, Client } from "@/types";
import type { CrmDashboardData } from "@/server/queries/crm-stats";

/**
 * Builds structured context for the AI Copilot to inject into LLM prompts.
 * This context enriches every Brain AI query with the user's current CRM state.
 * Foundation for future RAG/Fine-tuning of the Copilot.
 */
export function buildCopilotContext(params: {
    currentModule: string;
    crmStats?: CrmDashboardData;
    activeProperty?: Property;
    activeClient?: Client;
    userProfile?: User;
}): CopilotContext {
    const context: CopilotContext = {
        currentModule: params.currentModule,
    };

    // User profile context
    if (params.userProfile) {
        context.userProfile = {
            id: params.userProfile.id,
            email: params.userProfile.email_usuario,
            nombre: params.userProfile.nombre_usuario,
            actividad: params.userProfile.actividad_usuario,
        };
    }

    // CRM stats summary
    if (params.crmStats) {
        context.crmStats = {
            totalPropiedades: params.crmStats.totalPropiedades,
            propiedadesVenta: params.crmStats.propiedadesVenta,
            propiedadesRenta: params.crmStats.propiedadesRenta,
            totalClientes: params.crmStats.totalClientes,
            totalOfertas: params.crmStats.totalOfertas,
            ofertasPendientes: params.crmStats.totalOfertas - params.crmStats.cierres.completados,
        };
    }

    // Active property context
    if (params.activeProperty) {
        context.activeProperty = {
            id: params.activeProperty.id,
            nombre: params.activeProperty.nombre,
            tipo: params.activeProperty.tipo,
            precio: params.activeProperty.precio,
            direccion: params.activeProperty.direccion,
        };
    }

    // Active client context
    if (params.activeClient) {
        context.activeClient = {
            id: params.activeClient.id_cliente,
            nombre: params.activeClient.nombre_cliente,
            email: params.activeClient.email_cliente,
        };
    }

    return context;
}

/**
 * Generates a human-readable system prompt from the copilot context.
 * Used when sending context to the Brain LLM.
 */
export function contextToPrompt(context: CopilotContext): string {
    const parts: string[] = [
        `Módulo actual: ${context.currentModule}`,
    ];

    if (context.userProfile) {
        parts.push(
            `Usuario: ${context.userProfile.nombre ?? "Sin nombre"} (${context.userProfile.email}), Actividad: ${context.userProfile.actividad ?? "No especificada"}`
        );
    }

    if (context.crmStats) {
        parts.push(
            `CRM Stats: ${context.crmStats.totalPropiedades} propiedades (${context.crmStats.propiedadesVenta} venta, ${context.crmStats.propiedadesRenta} renta), ` +
            `${context.crmStats.totalClientes} clientes, ${context.crmStats.totalOfertas} ofertas (${context.crmStats.ofertasPendientes} pendientes)`
        );
    }

    if (context.activeProperty) {
        parts.push(
            `Propiedad activa: "${context.activeProperty.nombre}" - ${context.activeProperty.tipo} en ${context.activeProperty.direccion} ($${context.activeProperty.precio.toLocaleString()})`
        );
    }

    if (context.activeClient) {
        parts.push(
            `Cliente activo: ${context.activeClient.nombre} (${context.activeClient.email})`
        );
    }

    return parts.join("\n");
}
