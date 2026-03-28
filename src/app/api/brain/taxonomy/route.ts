import { NextRequest, NextResponse } from "next/server";
import { brainTaxonomy } from "@/lib/brain-client";

/**
 * GET /api/brain/taxonomy?action=getTree
 * GET /api/brain/taxonomy?action=getAttributes&subsegmentId=123
 *
 * Server-side proxy for all Brain taxonomy calls.
 * Prevents CORS: browser calls this Next.js route, which calls ml.homepty.com server-to-server.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    try {
        switch (action) {
            case "getTree": {
                const tree = await brainTaxonomy.getTree();
                return NextResponse.json(tree);
            }

            case "getAttributes": {
                const subsegmentId = searchParams.get("subsegmentId");
                if (!subsegmentId) {
                    return NextResponse.json({ error: "subsegmentId required" }, { status: 400 });
                }
                const attrs = await brainTaxonomy.getAttributesBySubsegment(Number(subsegmentId));
                return NextResponse.json(attrs);
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        console.error(`[taxonomy proxy] action=${action} error:`, message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
