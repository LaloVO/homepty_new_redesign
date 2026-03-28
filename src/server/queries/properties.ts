"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  PropertyType,
  PropertyWithImages,
  PropertyWithImagesAndAmenities,
  QueryResponse,
} from "@/types";
interface PropsGetAllProperties {
  filters: {
    search: string;
    type_operation: string;
    type_property: string;
    precioMin?: string;
    precioMax?: string;
    habitaciones?: string;
    banios?: string;
    estacionamientos?: string;
    page: string;
  };
}
export async function getAllProperties({
  filters,
}: PropsGetAllProperties): Promise<QueryResponse<PropertyWithImages[]>> {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("propiedades")
    .select("*, imagenes_propiedades(*)")
    .order("created_at", { ascending: false });

  if (filters.search !== "") {
    queryBuilder = queryBuilder.ilike("nombre", `%${filters.search}%`);
  }

  if (filters.type_operation !== "") {
    queryBuilder = queryBuilder.eq(
      "id_tipo_accion",
      Number(filters.type_operation)
    );
  }
  if (filters.type_property !== "") {
    queryBuilder = queryBuilder.eq(
      "tipo",
      filters.type_property as PropertyType
    );
  }
  if (filters.precioMin) {
    queryBuilder = queryBuilder.gte("precio", Number(filters.precioMin));
  }
  if (filters.precioMax) {
    queryBuilder = queryBuilder.lte("precio", Number(filters.precioMax));
  }
  if (filters.habitaciones) {
    queryBuilder = queryBuilder.eq(
      "habitaciones",
      Number(filters.habitaciones)
    );
  }
  if (filters.banios) {
    queryBuilder = queryBuilder.eq("banios", Number(filters.banios));
  }
  if (filters.estacionamientos) {
    queryBuilder = queryBuilder.eq(
      "estacionamientos",
      Number(filters.estacionamientos)
    );
  }
  const { error, data: properties } = await queryBuilder;

  if (error) {
    console.log("Error al obtener las propiedades:", error);
    return {
      ok: false,
      message: "Error al obtener las propiedades. Por favor, intenta de nuevo.",
    };
  }

  // Fetch actions manually to join (missing FK workaround)
  const { data: actions } = await supabase
    .from("accionespropiedades")
    .select("*");

  const data = properties?.map((p) => ({
    ...p,
    accionespropiedades: actions?.find(
      (a) => a.id_accion_propiedad === p.id_tipo_accion
    ),
  })) as PropertyWithImages[];

  return {
    ok: true,
    message: "Propiedades obtenidas con éxito",
    data,
  };
}

export async function getAllPropertiesByCurrentUser(): Promise<
  QueryResponse<PropertyWithImages[]>
> {
  const { userId } = await verifySession();
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("propiedades")
    .select("*, imagenes_propiedades(*)")
    .eq("id_usuario", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error al obtener las propiedades del usuario:", error);
    return {
      ok: false,
      message: "Error al obtener las propiedades. Por favor, intenta de nuevo.",
    };
  }

  return {
    ok: true,
    message: "Propiedades del usuario obtenidas con éxito",
    data,
  };
}

export async function getAllUnitsByCurrentUser(): Promise<
  QueryResponse<PropertyWithImages[]>
> {
  const { userId } = await verifySession();
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("propiedades")
    .select("*, imagenes_propiedades(*)")
    .eq("id_usuario", userId)
    .eq("is_unit", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error al obtener las unidades del usuario:", error);
    return {
      ok: false,
      message: "Error al obtener las unidades. Por favor, intenta de nuevo.",
    };
  }

  return {
    ok: true,
    message: "Unidades del usuario obtenidas con éxito",
    data,
  };
}

export async function getAllDevelopmentsByCurrentUser(): Promise<
  QueryResponse<PropertyWithImages[]>
> {
  const { userId } = await verifySession();
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("propiedades")
    .select("*, imagenes_propiedades(*)")
    .eq("id_usuario", userId)
    .eq("is_unit", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error al obtener los desarrollos del usuario:", error);
    return {
      ok: false,
      message: "Error al obtener los desarrollos. Por favor, intenta de nuevo.",
    };
  }

  return {
    ok: true,
    message: "Desarrollos del usuario obtenidos con éxito",
    data,
  };
}

export async function getPropertyById({
  id,
}: {
  id: number;
}): Promise<QueryResponse<PropertyWithImagesAndAmenities>> {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("propiedades")
    .select("*, imagenes_propiedades(*), amenidades_propiedades(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.log("Error al obtener la propiedad por ID:", error);
    return {
      ok: false,
      message: "Error al obtener la propiedad. Por favor, intenta de nuevo.",
    };
  }

  return {
    ok: true,
    message: "Propiedad obtenida con éxito",
    data,
  };
}

export async function getAvailableUnitsForDevelopment(): Promise<
  QueryResponse<PropertyWithImages[]>
> {
  const { userId } = await verifySession();
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("propiedades")
    .select("*, imagenes_propiedades(*)")
    .eq("id_usuario", userId)
    .eq("is_unit", true)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error al obtener las unidades disponibles:", error);
    return {
      ok: false,
      message: "Error al obtener las unidades. Por favor, intenta de nuevo.",
    };
  }

  return {
    ok: true,
    message: "Unidades disponibles obtenidas con éxito",
    data,
  };
}
