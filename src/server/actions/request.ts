"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RequestSchema } from "@/schemas";
import { Request } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { trackActivity } from "./activity-tracker";
import z from "zod";

export async function createRequestAction({ request }: { request: unknown }) {
  const validatedFields = RequestSchema.safeParse(request);

  if (!validatedFields.success) {
    return {
      ok: false,
      message: "Error de validación. Por favor, revisa los campos.",
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const { userId } = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase.from("solicitudes").insert({
    ...validatedFields.data,
    usuario_id: userId,
  });

  if (error) {
    console.error("Error al crear la solicitud:", error);
    return {
      ok: false,
      message: "Error al crear la solicitud. Por favor, intenta de nuevo.",
    };
  }
  revalidatePath("/requests");
  trackActivity({ tipo_actividad: "solicitud_creada", modulo: "requests", entidad_tipo: "solicitud", metadata: { tipo_operacion: validatedFields.data.tipo_operacion } }).catch(() => { });
  redirect("/requests");
}

export async function editRequestAction({
  id,
  request,
}: {
  id: Request["id"];
  request: unknown;
}) {
  const validatedFields = RequestSchema.safeParse(request);

  if (!validatedFields.success) {
    return {
      ok: false,
      message: "Error de validación. Por favor, revisa los campos.",
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const { userId } = await verifySession();
  const supabase = await createClient();

  // Fetch current state to detect transitions
  const { data: currentRequest } = await supabase
    .from("solicitudes")
    .select("estado_solicitud, nombre_contacto, correo_contacto, telefono_contacto")
    .eq("id", id)
    .eq("usuario_id", userId)
    .single();

  const { error } = await supabase
    .from("solicitudes")
    .update({
      ...validatedFields.data,
    })
    .eq("id", id)
    .eq("usuario_id", userId);

  if (error) {
    console.error("Error al editar la solicitud:", error);
    return {
      ok: false,
      message: "Error al editar la solicitud. Por favor, intenta de nuevo.",
    };
  }

  // Auto-create CRM client when solicitud transitions to 'en_proceso' (approved)
  const newState = (validatedFields.data as { estado_solicitud?: string }).estado_solicitud;
  if (
    newState === "en_proceso" &&
    currentRequest &&
    currentRequest.estado_solicitud !== "en_proceso"
  ) {
    try {
      await autoCreateClientFromRequest(supabase, userId, currentRequest, id);
    } catch (err) {
      console.warn("[CRM] Auto-create client failed (non-blocking):", err);
    }
  }

  revalidatePath("/requests");
  revalidatePath("/crm/clients");
  redirect("/requests");
}

/**
 * Auto-creates a CRM client when a solicitud is approved (en_proceso).
 * Avoids duplicates by checking email.
 */
async function autoCreateClientFromRequest(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  request: {
    nombre_contacto: string | null;
    correo_contacto: string;
    telefono_contacto: string | null;
  },
  requestId: number
) {
  if (!request.correo_contacto) return;

  // Check if client already exists
  const { data: existing } = await supabase
    .from("clientes")
    .select("id_cliente")
    .eq("email_cliente", request.correo_contacto)
    .eq("id_usuario", userId)
    .maybeSingle();

  if (existing) return; // Already a client

  const { error } = await supabase.from("clientes").insert({
    nombre_cliente: request.nombre_contacto ?? "Sin nombre",
    email_cliente: request.correo_contacto,
    telefono_cliente: request.telefono_contacto ?? "",
    dni_cif_cliente: `AUTO-SOL-${requestId}`,
    id_usuario: userId,
    nota_cliente: `Auto-creado desde solicitud #${requestId}`,
  });

  if (error) {
    console.error("[CRM] Error auto-creating client:", error.message);
  }
}
