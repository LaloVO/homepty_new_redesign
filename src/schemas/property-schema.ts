import z from "zod";

// ============================================================
// TIPOS DE UNIDAD — todos los subsegmentos de la taxonomía
// Deben estar sincronizados con TYPES_OF_UNITS en constants.ts
// ============================================================
export const UNIT_TIPO_VALUES = [
  // Residencial
  "Casa sola",
  "Casa en condominio",
  "Villa / Residencia",
  "Departamento",
  "Loft",
  "Penthouse",
  "Studio",
  "Casa de playa",
  "Cabaña / Glamping",
  // Comercial
  "Local comercial",
  "Plaza comercial",
  "Centro comercial",
  "Restaurante",
  "Dark kitchen",
  // Oficinas
  "Oficina corporativa",
  "Coworking / Flex",
  "Consultorio",
  // Industrial
  "Bodega logística",
  "Centro de distribución",
  "Nave industrial",
  "Parque industrial",
  // Hospitalidad
  "Hotel",
  "Boutique hotel",
  "Airbnb / Vacation rental",
  // Salud
  "Clínica / Consultorio",
  "Hospital",
  // Terrenos
  "Terreno urbano",
  "Lote residencial",
  "Terreno industrial",
  "Terreno agropecuario",
] as const;

// ============================================================
// CATEGORÍAS DE DESARROLLO — modelo de proyecto, no tipo de inmueble
// Deben estar sincronizados con TYPES_OF_DEVELOPMENTS en constants.ts
// ============================================================
export const DEVELOPMENT_TIPO_VALUES = [
  "Vertical",
  "Horizontal",
  "Uso Mixto",
  "Parque Industrial",
  "Master Plan",
  "Comercial / Retail",
  "Hotelero / Turístico",
  "Oficinas Corporativas",
  "Reconversión / Retrofit",
] as const;

// ============================================================
// SCHEMA BÁSICO — compartido entre unidades y desarrollos
// El campo `tipo` se sobreescribe en cada schema específico
// ============================================================
const BasicInfoBaseSchema = z.object({
  nombre: z.string().min(4, "Mínimo 4 caracteres"),
  id_tipo_accion: z.number().int().positive().default(1),
  id_tipo_uso: z.number().int().positive().default(1),
  descripcion: z.string().min(10, "Mínimo 10 caracteres"),
  descripcion_estado: z.string().min(10, "Mínimo 10 caracteres"),
  descripcion_inversion: z.string().optional(),
});

// Schema para unidades (tipo = tipo de inmueble)
export const BasicInfoPropertySchema = BasicInfoBaseSchema.extend({
  tipo: z.enum(UNIT_TIPO_VALUES, {
    message: "Debes seleccionar un tipo de unidad",
  }),
});

// Schema para desarrollos (tipo = categoría de proyecto)
export const BasicInfoDevelopmentSchema = BasicInfoBaseSchema.extend({
  tipo: z.enum(DEVELOPMENT_TIPO_VALUES, {
    message: "Debes seleccionar una categoría de desarrollo",
  }),
});

// ============================================================
// SCHEMA DE UBICACIÓN Y CARACTERÍSTICAS
// ============================================================
export const LocationCharacteristicsPropertySchema = z.object({
  area: z.number().positive("Debe ser positivo"),
  area_construida: z.number().positive("Debe ser positivo").optional(),
  precio: z.number().positive("Debe ser positivo"),
  habitaciones: z.number().int(),
  banios: z.number().int(),
  estacionamientos: z.number().int().optional(),
  caracteristicas: z.string().optional(),
  id_estado: z.number("Campo obligatorio").int(),
  id_ciudad: z.number("Campo obligatorio").int(),
  direccion: z.string("Campo obligatorio").min(5, "Mínimo 5 caracteres"),
  codigo_postal: z.string().optional(),
  colonia: z.string().optional(),
  amenidades: z.array(z.number().int()).optional(),
});

// ============================================================
// SCHEMAS COMPLETOS
// ============================================================
export const PropertySchema = z.object({
  ...BasicInfoPropertySchema.shape,
  ...LocationCharacteristicsPropertySchema.shape,
});

export const DevelopmentSchema = z.object({
  ...BasicInfoDevelopmentSchema.shape,
  ...LocationCharacteristicsPropertySchema.shape,
});

// ============================================================
// TIPOS INFERIDOS
// ============================================================
export type BasicInfoProperty = z.infer<typeof BasicInfoPropertySchema>;
export type BasicInfoDevelopment = z.infer<typeof BasicInfoDevelopmentSchema>;
export type LocationCharacteristicsProperty = z.infer<
  typeof LocationCharacteristicsPropertySchema
>;
