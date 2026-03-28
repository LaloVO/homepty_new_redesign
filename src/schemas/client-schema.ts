import z from "zod";
import { UNIT_TIPO_VALUES } from "./property-schema";

export const ClientSchema = z.object({
    nombre_cliente: z.string().min(1, "El nombre del cliente es obligatorio"),
    email_cliente: z.email("El correo electrónico no es válido"),
    telefono_cliente: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
    dni_cif_cliente: z.string().min(1, "El DNI/CIF es obligatorio"),
    presupuesto_desde_cliente: z.number("Debe ser un número").nullable(),
    presupuesto_hasta_cliente: z.number("Debe ser un número").nullable(),
    nota_cliente: z.string().optional(),
    cantidad_banios: z.number("Debe ser un número"),
    cantidad_habitaciones: z.number("Debe ser un número"),
    cantidad_estacionamientos: z.number("Debe ser un número"),
    // Taxonomía v2: todos los tipos de unidad de la nueva taxonomía
    tipo_propiedad: z.enum(UNIT_TIPO_VALUES, { message: "El tipo de propiedad no es válido" }),
    accion: z.string().nullable()
}).required();
