"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generateCBFApiKey } from "@/lib/crypto/generate-api-key";
import { CreateUserSiteSchema, UpdateUserSiteSchema } from "@/schemas";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Crea un nuevo sitio web para el usuario actual
 * @param userSite - Datos del sitio a crear
 * @returns ActionResponse con el resultado de la operación
 */
export async function createUserSiteAction({
  userSite,
}: {
  userSite: unknown;
}): Promise<ActionResponse> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Validar datos de entrada
  const validatedFields = CreateUserSiteSchema.safeParse(userSite);
  if (!validatedFields.success) {
    console.error("Error de validación:", validatedFields.error);
    return {
      ok: false,
      message: "Error de validación. Por favor, revisa los campos.",
    };
  }

  // Verificar que el usuario no tenga ya un sitio
  const { data: existingSite } = await supabase
    .from("user_sites")
    .select("id")
    .eq("user_id_supabase", userId)
    .maybeSingle();

  if (existingSite) {
    return {
      ok: false,
      message: "Ya tienes un sitio web configurado. Solo puedes tener uno.",
    };
  }

  // Verificar disponibilidad del subdominio si se proporciona
  if (validatedFields.data.subdomain) {
    const { data: subdomainExists } = await supabase
      .from("user_sites")
      .select("id")
      .eq("subdomain", validatedFields.data.subdomain)
      .maybeSingle();

    if (subdomainExists) {
      return {
        ok: false,
        message: "El subdominio ya está en uso. Por favor, elige otro.",
      };
    }
  }

  // Generar CBF API Key
  const cbfApiKey = generateCBFApiKey();

  // Crear el sitio
  const { error } = await supabase.from("user_sites").insert({
    user_id_supabase: userId,
    site_name: validatedFields.data.site_name,
    subdomain: validatedFields.data.subdomain || null,
    custom_domain: validatedFields.data.custom_domain || null,
    cbf_api_key: cbfApiKey,
    theme_config: validatedFields.data.theme_config || {
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF",
      logo: null,
      banner: null,
      fontFamily: "Inter",
    },
    seo_config: validatedFields.data.seo_config || {
      title: null,
      description: null,
      keywords: [],
    },
  });

  if (error) {
    console.error("Error al crear el sitio:", error);
    return {
      ok: false,
      message: "Error al crear el sitio web. Por favor, intenta de nuevo.",
    };
  }

  revalidatePath("/my-site");
  return {
    ok: true,
    message: "Sitio web creado exitosamente.",
  };
}

/**
 * Actualiza el sitio web del usuario actual
 * @param userSite - Datos del sitio a actualizar
 * @returns ActionResponse con el resultado de la operación
 */
export async function updateUserSiteAction({
  userSite,
}: {
  userSite: unknown;
}): Promise<ActionResponse> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Validar datos de entrada
  const validatedFields = UpdateUserSiteSchema.safeParse(userSite);
  if (!validatedFields.success) {
    console.error("Error de validación:", validatedFields.error);
    return {
      ok: false,
      message: "Error de validación. Por favor, revisa los campos.",
    };
  }

  // Verificar disponibilidad del subdominio si se está actualizando
  if (validatedFields.data.subdomain) {
    const { data: subdomainExists } = await supabase
      .from("user_sites")
      .select("id, user_id_supabase")
      .eq("subdomain", validatedFields.data.subdomain)
      .maybeSingle();

    if (subdomainExists && subdomainExists.user_id_supabase !== userId) {
      return {
        ok: false,
        message: "El subdominio ya está en uso. Por favor, elige otro.",
      };
    }
  }

  // Actualizar el sitio
  const { error } = await supabase
    .from("user_sites")
    .update(validatedFields.data)
    .eq("user_id_supabase", userId);

  if (error) {
    console.error("Error al actualizar el sitio:", error);
    return {
      ok: false,
      message: "Error al actualizar el sitio web. Por favor, intenta de nuevo.",
    };
  }

  revalidatePath("/my-site");
  return {
    ok: true,
    message: "Sitio web actualizado exitosamente.",
  };
}

/**
 * Regenera la CBF API Key del usuario actual
 * @returns ActionResponse con el resultado de la operación
 */
export async function regenerateApiKeyAction(): Promise<ActionResponse> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Generar nueva CBF API Key
  const newApiKey = generateCBFApiKey();

  // Actualizar la API Key
  const { error } = await supabase
    .from("user_sites")
    .update({ cbf_api_key: newApiKey })
    .eq("user_id_supabase", userId);

  if (error) {
    console.error("Error al regenerar la API Key:", error);
    return {
      ok: false,
      message: "Error al regenerar la API Key. Por favor, intenta de nuevo.",
    };
  }

  revalidatePath("/my-site");
  return {
    ok: true,
    message: "API Key regenerada exitosamente. Asegúrate de actualizar tu sitio satélite con la nueva clave.",
  };
}

/**
 * Activa o desactiva el sitio web del usuario actual
 * @param isActive - Estado del sitio (true = activo, false = inactivo)
 * @returns ActionResponse con el resultado de la operación
 */
export async function toggleSiteStatusAction({
  isActive,
}: {
  isActive: boolean;
}): Promise<ActionResponse> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_sites")
    .update({ is_active: isActive })
    .eq("user_id_supabase", userId);

  if (error) {
    console.error("Error al cambiar el estado del sitio:", error);
    return {
      ok: false,
      message: "Error al cambiar el estado del sitio. Por favor, intenta de nuevo.",
    };
  }

  revalidatePath("/my-site");
  return {
    ok: true,
    message: isActive
      ? "Sitio web activado exitosamente."
      : "Sitio web desactivado exitosamente.",
  };
}
