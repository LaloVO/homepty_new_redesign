"use client";
/**
 * TaxonomyStep (Development)
 * Paso de clasificación taxonómica en el formulario multi-step de creación de desarrollo.
 *
 * Flujo: Vertical → Segmento → Subsegmento → Atributos especializados (EAV)
 *
 * Reutiliza el mismo componente TaxonomyStep del formulario de unidades.
 * Se importa directamente desde el módulo de unidades para mantener DRY.
 */
export { TaxonomyStep } from "@/components/property/unit/form/taxonomy-step";
