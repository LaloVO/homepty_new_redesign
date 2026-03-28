import z from "zod";

export const UserSchema = z
  .object({
    nombre_usuario: z
      .string()
      .min(2, {
        message: "El nombre de usuario debe tener al menos 2 caracteres",
      })
      .trim(),
    telefono_usuario: z
      .string()
      .min(10, { message: "El teléfono debe tener al menos 10 caracteres" })
      .trim(),
    email_usuario: z.email({ message: "Email inválido" }).trim(),
    actividad_usuario: z.string().trim(),
    id_estado: z.coerce.number(),
    id_ciudad: z.coerce.number(),
    descripcion_usuario: z
      .string()
      .max(500, {
        message: "La descripción no puede exceder los 500 caracteres",
      })
      .trim()
      .optional(),
    imagen_perfil_usuario: z
      .string()
      .url({ message: "URL de imagen inválida" })
      .optional()
      .or(z.literal("")),
  })
  .required();

