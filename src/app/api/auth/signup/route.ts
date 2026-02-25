"use server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password, nombre_usuario } = await request.json();

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre_usuario: nombre_usuario || email.split("@")[0],
                }
            }
        });

        if (error) {
            return NextResponse.json({
                ok: false,
                error: error.message
            }, { status: 400 });
        }

        return NextResponse.json({
            ok: true,
            user: data.user,
            message: "Usuario creado exitosamente"
        });
    } catch {
        return NextResponse.json({
            ok: false,
            error: "Error al procesar la solicitud"
        }, { status: 500 });
    }
}
