/**
 * Script para crear un usuario de prueba en Supabase
 * Ejecutar con: node create-test-user.mjs
 * Todo: Eliminar esto
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdnpkmnrnfkiuadpbeac.supabase.co/";
const supabaseAnonKey = "sb_publishable_xV7UWqA-AxoWUGdqkqIziw_c5PtQUYE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
    console.log("🔐 Intentando crear usuario de prueba...");

    const { data, error } = await supabase.auth.signUp({
        email: "eduardo@example.com",
        password: "Prueba",
        options: {
            emailRedirectTo: undefined,
            data: {
                nombre_usuario: "Eduardo Test",
            }
        }
    });

    if (error) {
        console.error("❌ Error al crear usuario:", error.message);

        // Si el usuario ya existe, intentamos hacer login para verificar
        if (error.message.includes("already registered")) {
            console.log("👤 El usuario ya existe, intentando login...");
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: "eduardo@example.com",
                password: "Prueba",
            });

            if (loginError) {
                console.error("❌ Error en login:", loginError.message);
            } else {
                console.log("✅ Login exitoso! El usuario ya existe y las credenciales son correctas.");
                console.log("📧 Email:", "eduardo@example.com");
                console.log("🔑 Contraseña:", "Prueba");
            }
        }
        return;
    }

    console.log("✅ Usuario creado exitosamente!");
    console.log("📧 Email:", "eduardo@example.com");
    console.log("🔑 Contraseña:", "Prueba");

    if (data?.user?.email_confirmed_at) {
        console.log("✉️ Email confirmado automáticamente");
    } else {
        console.log("⚠️ Puede que necesites confirmar el email desde el dashboard de Supabase");
    }
}

createTestUser();
