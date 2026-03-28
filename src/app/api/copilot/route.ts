import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { brainAI } from "@/lib/brain-client";
import { buildCopilotContext, contextToPrompt } from "@/lib/copilot-context";
import { getCrmDashboardStats } from "@/server/queries/crm-stats";
import { trackActivity } from "@/server/actions/activity-tracker";
import type { CopilotContext } from "@/lib/brain-types";

/**
 * POST /api/copilot
 * Server-side proxy to Brain LLM (Manus Forge / Gemini).
 * Ensures HOMEPTY_BRAIN_API_KEY stays server-side.
 *
 * Body: { message: string, context: CopilotContext }
 * Returns: { response: string, intent?: string }
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Verify user session
        const { userId } = await verifySession();
        if (!userId) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // 2. Parse request body
        const { message, context } = (await req.json()) as {
            message: string;
            context?: CopilotContext;
        };

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json(
                { error: "El mensaje es requerido" },
                { status: 400 }
            );
        }

        // 3. Fetch real CRM stats from Supabase (server-side, user-specific)
        let crmStats;
        try {
            crmStats = await getCrmDashboardStats();
        } catch {
            // Non-blocking: if stats fail, continue without them
        }

        // 4. Merge real CRM data with client-provided context (module, active property, etc.)
        const enrichedContext = buildCopilotContext({
            currentModule: context?.currentModule ?? "dashboard",
            crmStats,
        });
        const contextPrompt = contextToPrompt(enrichedContext);
        const enrichedQuery = `Contexto del usuario:\n${contextPrompt}\n\nPregunta: ${message}`;

        // 4. Route to the appropriate Brain AI endpoint
        let response: string;
        let intent: string = "general";

        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes("valuación") || lowerMessage.includes("valor") || lowerMessage.includes("precio")) {
            // Valuation interpretation
            intent = "valuacion";
            try {
                const result = await brainAI.conversational.search({
                    query: enrichedQuery,
                    context: { userId },
                });
                response = result.response;
            } catch {
                response = await fallbackResponse(enrichedQuery, userId);
            }
        } else if (lowerMessage.includes("inversión") || lowerMessage.includes("roi") || lowerMessage.includes("rentabilidad")) {
            // Investment analysis
            intent = "inversion";
            try {
                const result = await brainAI.conversational.search({
                    query: enrichedQuery,
                    context: { userId },
                });
                response = result.response;
            } catch {
                response = await fallbackResponse(enrichedQuery, userId);
            }
        } else if (lowerMessage.includes("oportunidad") || lowerMessage.includes("mercado")) {
            // Market opportunities
            intent = "mercado";
            try {
                const result = await brainAI.market.identifyOpportunities({
                    marketData: { query: enrichedQuery, userId },
                });
                response = typeof result === "string" ? result : JSON.stringify(result);
            } catch {
                response = await fallbackResponse(enrichedQuery, userId);
            }
        } else if (lowerMessage.includes("reporte") || lowerMessage.includes("informe")) {
            // Market report
            intent = "reporte";
            try {
                const result = await brainAI.market.generateReport({
                    marketData: { query: enrichedQuery, userId },
                });
                response = typeof result === "string" ? result : JSON.stringify(result);
            } catch {
                response = await fallbackResponse(enrichedQuery, userId);
            }
        } else {
            // General conversational search (fallback)
            intent = "general";
            try {
                const result = await brainAI.conversational.search({
                    query: enrichedQuery,
                    context: { userId },
                });
                response = result.response;
            } catch {
                response = await fallbackResponse(enrichedQuery, userId);
            }
        }

        // 5. Track this activity for ML & User History
        // run asynchronously so we don't block the UI
        trackActivity({
            tipo_actividad: "copilot_query",
            modulo: context?.currentModule ?? "unknown",
            metadata: {
                query: message,
                response: response,
                intent: intent
            }
        }).catch(err => console.warn("[CopilotAPI] Track err:", err));

        return NextResponse.json({
            response,
            intent,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[CopilotAPI] Error:", error);
        return NextResponse.json(
            {
                error: "Error al procesar la solicitud del copilot",
                response: "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.",
            },
            { status: 500 }
        );
    }
}

/**
 * Fallback when the primary AI endpoint fails.
 * Uses ai.conversational.search as last resort.
 */
async function fallbackResponse(query: string, userId: string): Promise<string> {
    try {
        const result = await brainAI.conversational.search({
            query,
            context: { userId },
        });
        return result.response;
    } catch {
        return "No pude conectar con el servicio de inteligencia artificial. Verifica que el Brain esté disponible.";
    }
}
