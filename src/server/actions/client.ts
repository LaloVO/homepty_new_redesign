"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ClientSchema } from "@/schemas";
import { ActionResponse, Client } from "@/types";
import { revalidatePath } from "next/cache";
import { trackActivity } from "./activity-tracker";

export async function createClientAction({
  client,
}: {
  client: unknown;
}): Promise<ActionResponse> {
  const { userId } = await verifySession();
  const validatedFields = ClientSchema.safeParse(client);
  if (!validatedFields.success) {
    console.log(validatedFields.error);
    return {
      ok: false,
      message: "Error de validación. Por favor, revisa los campos.",
    };
  }
  const supabase = await createClient();
  const { data: existingClient } = await supabase
    .from("clientes")
    .select("id_cliente")
    .eq("email_cliente", validatedFields.data.email_cliente)
    .or(`dni_cif_cliente.eq.${validatedFields.data.dni_cif_cliente}`)
    .maybeSingle();
  if (existingClient) {
    return {
      ok: false,
      message: "Ya existe un cliente con ese correo electrónico o DNI/CIF.",
    };
  }
  const { error } = await supabase.from("clientes").insert({
    ...validatedFields.data,
    id_usuario: userId,
  });
  if (error) {
    console.log(error);
    if (error.code === "23505") {
      return {
        ok: false,
        message: "Ya existe un cliente con ese correo electrónico o DNI/CIF.",
      };
    }
    return {
      ok: false,
      message: "Error al crear el cliente. Por favor, intenta de nuevo.",
    };
  }
  revalidatePath("/crm/clients");
  revalidatePath("/crm");
  trackActivity({ tipo_actividad: "cliente_creado", modulo: "crm", entidad_tipo: "cliente", metadata: { email: validatedFields.data.email_cliente } }).catch(() => { });
  return {
    ok: true,
    message: "Cliente creado exitosamente.",
  };
}

export async function updateClientAction({
  clientId,
  client,
}: {
  clientId: Client["id_cliente"];
  client: unknown;
}): Promise<ActionResponse> {
  const { userId } = await verifySession();
  const validatedFields = ClientSchema.safeParse(client);
  if (!validatedFields.success) {
    console.log(validatedFields.error);
    return {
      ok: false,
      message: "Error de validación. Por favor, revisa los campos.",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({
      ...validatedFields.data,
      id_usuario: userId,
    })
    .eq("id_cliente", clientId);
  if (error) {
    return {
      ok: false,
      message: "Error al actualizar el cliente. Por favor, intenta de nuevo.",
    };
  }
  revalidatePath("/crm/clients");
  return {
    ok: true,
    message: "Cliente actualizado exitosamente.",
  };
}

export async function deleteClientAction({
  clientId,
}: {
  clientId: Client["id_cliente"];
}): Promise<ActionResponse> {
  await verifySession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id_cliente", clientId);
  if (error) {
    console.log(error);
    return {
      ok: false,
      message: "Error al eliminar el cliente. Por favor, intenta de nuevo.",
    };
  }
  revalidatePath("/crm/clients");
  return {
    ok: true,
    message: "Cliente eliminado exitosamente.",
  };
}
