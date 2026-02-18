"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QueryResponse } from "@/types";
import { UserSiteRow } from "@/types/database-user-sites";

/**
 * Obtiene el sitio web del usuario actual
 * @returns QueryResponse con los datos del sitio o error
 */
export async function getUserSite(): Promise<QueryResponse<UserSiteRow>> {
  const { userId } = await verifySession();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_sites")
    .select("*")
    .eq("user_id_supabase", userId)
    .single();

  if (error) {
    // Si el error es que no existe el sitio, no es un error crítico
    if (error.code === "PGRST116") {
      return {
        ok: true,
        message: "El usuario no tiene un sitio web configurado",
        data: undefined,
      };
    }
    
    console.error("Error al obtener el sitio del usuario:", error);
    return {
      ok: false,
      message: "Error al obtener el sitio web. Por favor, intenta de nuevo.",
    };
  }

  return {
    ok: true,
    message: "Sitio web obtenido con éxito",
    data: data as UserSiteRow,
  };
}

/**
 * Verifica si un subdominio está disponible
 * @param subdomain - Subdominio a verificar
 * @returns true si está disponible, false si ya existe
 */
export async function checkSubdomainAvailability(
  subdomain: string
): Promise<QueryResponse<boolean>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_sites")
    .select("id")
    .eq("subdomain", subdomain)
    .maybeSingle();

  if (error) {
    console.error("Error al verificar disponibilidad del subdominio:", error);
    return {
      ok: false,
      message: "Error al verificar el subdominio. Por favor, intenta de nuevo.",
    };
  }

  return {
    ok: true,
    message: data ? "Subdominio no disponible" : "Subdominio disponible",
    data: !data, // true si está disponible (no existe)
  };
}
