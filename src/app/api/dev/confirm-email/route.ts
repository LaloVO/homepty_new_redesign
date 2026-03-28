/**
 * ENDPOINT TEMPORAL DE DESARROLLO
 * Confirma automáticamente usuarios de prueba
 * ⚠️ ELIMINAR EN PRODUCCIÓN
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({
                ok: false,
                error: "Email requerido"
            }, { status: 400 });
        }

        // Como no tenemos service role key, vamos a hacer signup con autoConfirm simulado
        // La mejor opción es desactivar la confirmación de email en Supabase

        return NextResponse.json({
            ok: false,
            error: "No se puede confirmar el email sin service role key. Opciones:",
            solutions: [
                "1. Ve al dashboard de Supabase > Authentication > Settings > Email Auth",
                "2. Desactiva 'Confirm email' temporalmente",
                "3. O proporciona SUPABASE_SERVICE_ROLE_KEY en .env"
            ]
        }, { status: 400 });

    } catch {
        return NextResponse.json({
            ok: false,
            error: "Error al procesar la solicitud"
        }, { status: 500 });
    }
}
