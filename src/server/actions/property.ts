"use server";
import { verifySession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/supabase/storage";
import { PropertySchema } from "@/schemas";
import { revalidatePath, revalidateTag } from "next/cache";
import { trackActivity } from "./activity-tracker";
import z from "zod";

export async function createUnitAction({
  unit,
  unitFiles,
}: {
  unit: unknown;
  unitFiles: File[];
}) {
  const { userId } = await verifySession();
  const supabase = await createClient();
  // Paso 1 -- Subir imagenes de la unidad al storage
  const uploadUnitImages = await Promise.all(
    unitFiles.map(async (file) => {
      const { error, imageUrl } = await uploadImage({
        file,
        bucket: "properties_images",
      });
      if (error) {
        throw new Error("Error al subir las imagenes de la unidad" + error);
      }
      return imageUrl;
    })
  );
  // Paso 2 -- Subir unidad
  const validatedFields = PropertySchema.safeParse(unit);
  if (!validatedFields.success) {
    console.log("Error de validación:", validatedFields.error);
    return {
      ok: false,
      message: "Error de validación. Por favor, revisa los campos.",
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const { amenidades, ...unitData } = validatedFields.data;
  const { data: unidad, error: errorUnidad } = await supabase
    .from("propiedades")
    .insert({
      ...unitData,
      id_usuario: userId,
      is_unit: true,
      parent_id: null,
    })
    .select()
    .single();
  if (errorUnidad) {
    return {
      ok: false,
      message: errorUnidad.message,
    };
  }

  // Paso 3 - Relacionar unidad e imagenes de la misma

  const { error } = await supabase.from("imagenes_propiedades").insert(
    uploadUnitImages.map((uploadImage) => ({
      id_propiedad: unidad.id,
      image_url: uploadImage,
    }))
  );

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  // Paso 4 - Subir a la tabla amenidades con id_amenidad y id_unidad
  if (amenidades && amenidades.length > 0) {
    const { error: errorAmenidades } = await supabase
      .from("amenidades_propiedades")
      .insert(
        amenidades.map((id_amenidad) => ({
          id_propiedad: unidad.id,
          id_amenidad,
        }))
      );
    if (errorAmenidades) {
      console.log("Error al insertar amenidades:", errorAmenidades);
      return {
        ok: false,
        message: errorAmenidades.message,
      };
    }
  }
  revalidatePath("/");
  revalidateTag("properties", "max");
  trackActivity({ tipo_actividad: "propiedad_listada", modulo: "crm", entidad_id: String(unidad.id), entidad_tipo: "propiedad", metadata: { tipo: unitData.tipo, is_unit: true } }).catch(() => { });
  return {
    ok: true,
    message: "Unidad creada con éxito",
  };
}

export async function createDevelopmentAction({
  development,
  developmentFiles,
  unitIds = [],
}: {
  development: unknown;
  developmentFiles: File[];
  unitIds?: number[];
}) {
  const { userId } = await verifySession();
  const supabase = await createClient();

  // Paso 1 -- Subir imagenes del desarrollo al storage
  const uploadDevelopmentImages = await Promise.all(
    developmentFiles.map(async (file) => {
      const { error, imageUrl } = await uploadImage({
        file,
        bucket: "properties_images",
      });
      if (error) {
        throw new Error("Error al subir las imagenes del desarrollo: " + error);
      }
      return imageUrl;
    })
  );

  // Paso 2 -- Subir desarrollo
  const validatedFields = PropertySchema.safeParse(development);
  if (!validatedFields.success) {
    console.log("Error de validación:", validatedFields.error);
    return {
      ok: false,
      message: "Error de validación. Por favor, revisa los campos.",
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const { data: desarrolloData, error: errorDesarrollo } = await supabase
    .from("propiedades")
    .insert({
      tipo: validatedFields.data.tipo,
      nombre: validatedFields.data.nombre,
      id_tipo_accion: validatedFields.data.id_tipo_accion,
      id_tipo_uso: validatedFields.data.id_tipo_uso,
      descripcion: validatedFields.data.descripcion,
      descripcion_estado: validatedFields.data.descripcion_estado,
      descripcion_inversion: validatedFields.data.descripcion_inversion,
      area: validatedFields.data.area,
      area_construida: validatedFields.data.area_construida,
      precio: validatedFields.data.precio,
      habitaciones: validatedFields.data.habitaciones,
      banios: validatedFields.data.banios,
      estacionamientos: validatedFields.data.estacionamientos,
      caracteristicas: validatedFields.data.caracteristicas,
      id_estado: validatedFields.data.id_estado,
      id_ciudad: validatedFields.data.id_ciudad,
      codigo_postal: validatedFields.data.codigo_postal,
      direccion: validatedFields.data.direccion,
      colonia: validatedFields.data.colonia,
      id_usuario: userId,
      is_unit: false,
      parent_id: null,
    })
    .select()
    .single();

  if (errorDesarrollo) {
    return {
      ok: false,
      message: errorDesarrollo.message,
    };
  }

  // Paso 3 - Relacionar desarrollo e imagenes del mismo
  const { error } = await supabase.from("imagenes_propiedades").insert(
    uploadDevelopmentImages.map((uploadImage) => ({
      id_propiedad: desarrolloData.id,
      image_url: uploadImage,
    }))
  );

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  // Paso 4 - Asignar unidades seleccionadas al desarrollo
  if (unitIds.length > 0) {
    const { error: unitsError } = await supabase
      .from("propiedades")
      .update({ parent_id: desarrolloData.id })
      .in("id", unitIds);

    if (unitsError) {
      return {
        ok: false,
        message:
          "Error al asignar las unidades al desarrollo: " + unitsError.message,
      };
    }
  }

  revalidatePath("/");
  revalidateTag("properties", "max");
  trackActivity({ tipo_actividad: "propiedad_listada", modulo: "crm", entidad_id: String(desarrolloData.id), entidad_tipo: "propiedad", metadata: { tipo: validatedFields.data.tipo, is_unit: false, units_count: unitIds.length } }).catch(() => { });
  return {
    ok: true,
    message: "Desarrollo creado con éxito"
  };
}
