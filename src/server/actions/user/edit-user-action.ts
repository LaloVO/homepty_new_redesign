"use server";
import { createClient } from "@/lib/supabase/server";
import { UserSchema } from "@/schemas";
import { FormState, User } from "@/types";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function updateUserAction(
  userId: string,
  state: FormState<User>,
  formData: FormData
) {
  const entries = Object.fromEntries(formData.entries());
  const validatedFields = UserSchema.safeParse(entries);
  if (!validatedFields.success) {
    return {
      ok: false,
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: "Error de validación. Por favor, revisa los campos.",
      inputs: entries,
    };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    nombre_usuario: validatedFields.data.nombre_usuario,
    telefono_usuario: validatedFields.data.telefono_usuario,
    email_usuario: validatedFields.data.email_usuario,
    actividad_usuario: validatedFields.data.actividad_usuario,
    id_estado: validatedFields.data.id_estado,
    id_ciudad: validatedFields.data.id_ciudad,
    descripcion_usuario: validatedFields.data.descripcion_usuario,
  };

  // Only update image if a URL was provided
  if (validatedFields.data.imagen_perfil_usuario) {
    updateData.imagen_perfil_usuario = validatedFields.data.imagen_perfil_usuario;
  }

  const { error } = await supabase
    .from("usuarios")
    .update(updateData)
    .eq("id", userId);

  if (error) {
    console.log("Error updating user:", error);
    return {
      ok: false,
      message: "Error al actualizar el perfil. Por favor, intenta de nuevo.",
      inputs: validatedFields.data,
    };
  }
  revalidatePath(`/${userId}/profile`, "page");
  return {
    ok: true,
    message: "Perfil actualizado correctamente.",
  };
}
