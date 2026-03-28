import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { brainAI } from "@/lib/brain-client";
import type { AIMarketDataInput } from "@/lib/brain-types";

const LOG = "[Brain/Market/Opportunities]";

/**
 * POST /api/brain/market/opportunities
 * Server-side proxy to brainAI.market.identifyOpportunities (apiKeyProcedure).
 * Keeps HOMEPTY_BRAIN_API_KEY server-side only.
 *
 * Body: AIMarketDataInput
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await verifySession();
        if (!userId) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = (await req.json()) as AIMarketDataInput;

        console.log(`\n${LOG} ──────────────────────────────────────`);
        console.log(`${LOG} 👤 userId: ${userId}`);
        console.log(`${LOG} 📤 REQUEST →`, JSON.stringify(body, null, 2));

        const result = await brainAI.market.identifyOpportunities(body);

        console.log(`${LOG} 📥 RESPONSE ←`, JSON.stringify(result, null, 2));
        console.log(`${LOG} ──────────────────────────────────────\n`);

        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        console.error(`${LOG} ❌ ERROR:`, message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
