"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QueryResponse, User } from "@/types";

export type UserWithLocation = User & {
  estados?: { nombre_estado: string } | null;
  ciudades?: { nombre_ciudad: string } | null;
};

export async function getUserInfo(): Promise<QueryResponse<UserWithLocation>> {
  const supabase = await createClient();
  const { userId } = await verifySession();
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      *,
      estados (nombre_estado),
      ciudades (nombre_ciudad)
    `)
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.log("Error profile user: ", error);
    return {
      ok: false,
      message: "Error al obtener el perfil del usuario.",
    };
  }
  return {
    ok: true,
    message: "Usuario actual obtenido correctamente.",
    data: data as UserWithLocation,
  };
}
