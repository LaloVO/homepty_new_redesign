"use client";
/**
 * useTaxonomy v2.0 — Taxonomía Inmobiliaria PropTech México
 *
 * ARQUITECTURA CORREGIDA (SHF / CONAVI / CANADEVI / AMPIP / SECTUR):
 * ─────────────────────────────────────────────────────────────────────
 *
 *   Vertical (¿qué tipo de mercado?)
 *     ├── Tipología (¿qué forma física tiene el inmueble?)  ← TRANSVERSAL al segmento
 *     │     Un "Departamento" puede ser Económico o de Lujo.
 *     │     El usuario busca por tipo de inmueble, no por NSE.
 *     │
 *     └── Segmento (¿a qué nivel socioeconómico/mercado pertenece?)
 *           └── Subsegmento (especialización dentro del segmento)
 *
 * Flujo del selector en cascada:
 *   1. Seleccionar Vertical  → habilita Tipología Y Segmento
 *   2. Seleccionar Tipología → filtra qué subsegmentos aplican (opcional)
 *   3. Seleccionar Segmento  → habilita Subsegmento
 *   4. Seleccionar Subsegmento → carga Atributos EAV especializados
 *
 * Parámetro `tipoUso` (id_tipo_uso de la BD):
 *   1 = Residencial  → Vertical 1 (Residencial) + 5 (Hospitalidad) + 7 (Terrenos)
 *   2 = Comercial    → Vertical 2 (Comercial) + 3 (Oficinas) + 6 (Salud) + 8 (Especializados)
 *   3 = Industrial   → Vertical 4 (Industrial) + 7 (Terrenos)
 *   4 = Mixto        → Todas las verticales
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  brainTaxonomy,
  type TaxVertical,
  type TaxSegment,
  type TaxSubsegment,
  type TaxAttribute,
  type TaxonomyTree,
} from "@/lib/brain-client";

// ─── Tipos adicionales para v2.0 ──────────────────────────────────────────────

export interface TaxTipologia {
  id: number;
  verticalId: number;
  nombre: string;
  descripcion?: string | null;
  codigoOficial?: string | null;
  orden: number;
}

export interface TaxonomySelection {
  verticalId: number | null;
  tipologiaId: number | null;   // v2.0: Forma físico-estructural (transversal al NSE)
  segmentId: number | null;
  subsegmentId: number | null;
}

export interface UseTaxonomyOptions extends Partial<TaxonomySelection> {
  /**
   * id_tipo_uso de la BD (1=Residencial, 2=Comercial, 3=Industrial, 4=Mixto).
   * Cuando se provee, filtra las verticales disponibles para garantizar coherencia.
   */
  tipoUso?: number | null;
}

export interface UseTaxonomyReturn {
  // Datos del árbol (v1 compat)
  tree: TaxonomyTree;
  isLoading: boolean;
  // Selección actual
  selection: TaxonomySelection;
  // Opciones disponibles según la selección en cascada
  availableVerticals: TaxVertical[];
  availableTipologias: TaxTipologia[];   // v2.0
  availableSegments: TaxSegment[];
  availableSubsegments: TaxSubsegment[];
  // Atributos dinámicos del subsegmento seleccionado
  dynamicAttributes: TaxAttribute[];
  // Acciones
  selectVertical: (verticalId: number | null) => void;
  selectTipologia: (tipologiaId: number | null) => void;  // v2.0
  selectSegment: (segmentId: number | null) => void;
  selectSubsegment: (subsegmentId: number | null) => void;
  reset: () => void;
  // Helpers
  selectedVertical: TaxVertical | null;
  selectedTipologia: TaxTipologia | null;  // v2.0
  selectedSegment: TaxSegment | null;
  selectedSubsegment: TaxSubsegment | null;
  // Breadcrumb de la selección
  breadcrumb: string;
}

// ─── Datos de fallback estáticos v2.0 ─────────────────────────────────────────

/**
 * Tipologías por vertical — Forma físico-estructural del inmueble.
 * TRANSVERSAL al segmento NSE: un "Departamento" puede ser Económico o Lujo.
 * Referencia: INDAABIN / SHF / AMPI
 */
export const FALLBACK_TIPOLOGIAS: TaxTipologia[] = [
  // ── RESIDENCIAL ────────────────────────────────────────────────────────────
  { id: 1, verticalId: 1, nombre: "Casa", descripcion: "Vivienda unifamiliar independiente con terreno propio", orden: 1, codigoOficial: "H-UNI-01" },
  { id: 2, verticalId: 1, nombre: "Casa en Condominio", descripcion: "Casa dentro de un desarrollo cerrado con áreas comunes", orden: 2, codigoOficial: "H-UNI-02" },
  { id: 3, verticalId: 1, nombre: "Townhouse", descripcion: "Casa adosada en hilera, 2-3 niveles, patio privado", orden: 3, codigoOficial: "H-UNI-03" },
  { id: 4, verticalId: 1, nombre: "Villa / Residencia", descripcion: "Residencia de lujo con jardín amplio y amenidades privadas", orden: 4, codigoOficial: "H-UNI-04" },
  { id: 5, verticalId: 1, nombre: "Departamento", descripcion: "Unidad habitacional en edificio multifamiliar", orden: 5, codigoOficial: "H-PLU-01" },
  { id: 6, verticalId: 1, nombre: "Loft", descripcion: "Espacio abierto de doble altura, uso mixto habitacional", orden: 6, codigoOficial: "H-PLU-02" },
  { id: 7, verticalId: 1, nombre: "Penthouse", descripcion: "Unidad de lujo en el último piso con terraza privada", orden: 7, codigoOficial: "H-PLU-03" },
  { id: 8, verticalId: 1, nombre: "Studio", descripcion: "Unidad compacta de un solo espacio, sin recámara separada", orden: 8, codigoOficial: "H-PLU-04" },
  { id: 9, verticalId: 1, nombre: "Garden House", descripcion: "Unidad en planta baja con jardín de uso exclusivo", orden: 9, codigoOficial: "H-PLU-05" },
  { id: 10, verticalId: 1, nombre: "Casa de Playa", descripcion: "Vivienda en zona costera o frente de playa", orden: 10, codigoOficial: "H-VAC-01" },
  { id: 11, verticalId: 1, nombre: "Cabaña / Glamping", descripcion: "Vivienda en zona rural, montaña o naturaleza", orden: 11, codigoOficial: "H-VAC-02" },
  { id: 12, verticalId: 1, nombre: "Edificio de Departamentos", descripcion: "Inmueble completo con múltiples unidades (inversión)", orden: 12, codigoOficial: "H-INV-01" },
  // ── COMERCIAL ──────────────────────────────────────────────────────────────
  { id: 13, verticalId: 2, nombre: "Local Comercial", descripcion: "Espacio individual de venta al por menor", orden: 1 },
  { id: 14, verticalId: 2, nombre: "Plaza Comercial", descripcion: "Desarrollo con múltiples locales y estacionamiento", orden: 2 },
  { id: 15, verticalId: 2, nombre: "Centro Comercial / Mall", descripcion: "Desarrollo de gran escala con tienda ancla", orden: 3 },
  { id: 16, verticalId: 2, nombre: "Lifestyle Center", descripcion: "Centro abierto enfocado en gastronomía y entretenimiento", orden: 4 },
  { id: 17, verticalId: 2, nombre: "Strip Mall", descripcion: "Centro comercial de formato lineal para comercio vecinal", orden: 5 },
  { id: 18, verticalId: 2, nombre: "Restaurante / F&B", descripcion: "Local especializado para alimentos y bebidas", orden: 6 },
  { id: 19, verticalId: 2, nombre: "Dark Kitchen", descripcion: "Cocina industrial sin área de comensales, solo delivery", orden: 7 },
  // ── OFICINAS ───────────────────────────────────────────────────────────────
  { id: 20, verticalId: 3, nombre: "Edificio Corporativo", descripcion: "Torre o edificio de oficinas de uso exclusivo", orden: 1 },
  { id: 21, verticalId: 3, nombre: "Planta / Piso Completo", descripcion: "Piso completo dentro de un edificio de oficinas", orden: 2 },
  { id: 22, verticalId: 3, nombre: "Oficina Individual", descripcion: "Unidad de oficina dentro de un edificio compartido", orden: 3 },
  { id: 23, verticalId: 3, nombre: "Coworking / Flex", descripcion: "Espacio de trabajo compartido con membresía flexible", orden: 4 },
  { id: 24, verticalId: 3, nombre: "Consultorio", descripcion: "Espacio para atención profesional", orden: 5 },
  // ── INDUSTRIAL ─────────────────────────────────────────────────────────────
  { id: 25, verticalId: 4, nombre: "Nave Industrial", descripcion: "Estructura de gran claro para manufactura o almacenamiento", orden: 1, codigoOficial: "UI-01" },
  { id: 26, verticalId: 4, nombre: "Bodega Logística", descripcion: "Almacén para distribución y fulfillment", orden: 2, codigoOficial: "UI-02" },
  { id: 27, verticalId: 4, nombre: "CEDIS", descripcion: "Centro de Distribución de gran escala", orden: 3, codigoOficial: "UI-03" },
  { id: 28, verticalId: 4, nombre: "Parque Industrial", descripcion: "Polígono planificado con infraestructura y servicios centralizados", orden: 4, codigoOficial: "UI-09" },
  { id: 29, verticalId: 4, nombre: "Corredor Industrial", descripcion: "Desarrollo logístico alineado sobre vía federal o ferrocarril", orden: 5, codigoOficial: "UI-10" },
  { id: 30, verticalId: 4, nombre: "Instalación Especializada", descripcion: "Cold storage, laboratorio farmacéutico, cleanroom", orden: 6 },
  // ── HOSPITALIDAD ───────────────────────────────────────────────────────────
  { id: 31, verticalId: 5, nombre: "Hotel Urbano / Business", descripcion: "Hotel orientado al viajero de negocios", orden: 1 },
  { id: 32, verticalId: 5, nombre: "Hotel Boutique", descripcion: "Propiedad de diseño de autor, servicio hiperpersonalizado", orden: 2 },
  { id: 33, verticalId: 5, nombre: "Resort / Todo Incluido", descripcion: "Macro-desarrollo vacacional", orden: 3 },
  { id: 34, verticalId: 5, nombre: "Motel / Hotel de Tránsito", descripcion: "Acceso vehicular directo a la habitación", orden: 4 },
  { id: 35, verticalId: 5, nombre: "Hostal", descripcion: "Alojamiento en dormitorios compartidos", orden: 5 },
  { id: 36, verticalId: 5, nombre: "Glamping / Eco-Lodge", descripcion: "Estructura efímera o de bajo impacto ambiental", orden: 6 },
  // ── SALUD ──────────────────────────────────────────────────────────────────
  { id: 37, verticalId: 6, nombre: "Consultorio Médico", descripcion: "Espacio básico para auscultación y diagnóstico", orden: 1 },
  { id: 38, verticalId: 6, nombre: "Consultorio de Especialidad", descripcion: "Odontología, nutriología, oftalmología, etc.", orden: 2 },
  { id: 39, verticalId: 6, nombre: "Clínica / Centro Ambulatorio", descripcion: "Unidades de procedimientos y cirugía de corta estancia", orden: 3 },
  { id: 40, verticalId: 6, nombre: "Hospital", descripcion: "Instalaciones con hospitalización, UCI y urgencias", orden: 4 },
  { id: 41, verticalId: 6, nombre: "Residencia Geriátrica", descripcion: "Assisted Living, Memory Care para adultos mayores", orden: 5 },
  // ── TERRENOS / RURAL ───────────────────────────────────────────────────────
  { id: 42, verticalId: 7, nombre: "Lote Residencial", descripcion: "Lote baldío en fraccionamiento o colonia residencial", orden: 1, codigoOficial: "AT-RES" },
  { id: 43, verticalId: 7, nombre: "Macrolote Comercial", descripcion: "Polígono de gran extensión para desarrollo comercial o mixto", orden: 2, codigoOficial: "AT-COM" },
  { id: 44, verticalId: 7, nombre: "Lote Industrial", descripcion: "Predio dentro de la poligonal de un parque industrial", orden: 3, codigoOficial: "AT-IND" },
  { id: 45, verticalId: 7, nombre: "Tierra Agrícola", descripcion: "Tierras de riego o temporal para cultivo", orden: 4, codigoOficial: "AT-AGR" },
  { id: 46, verticalId: 7, nombre: "Tierra Ganadera", descripcion: "Agostadero para pastoreo y cría extensiva de ganado", orden: 5, codigoOficial: "AT-PEC" },
  { id: 47, verticalId: 7, nombre: "Tierra Forestal", descripcion: "Bosques, selvas y superficies de aprovechamiento silvícola", orden: 6, codigoOficial: "AT-FOR" },
  { id: 48, verticalId: 7, nombre: "Propiedad Rural de Nicho", descripcion: "Hacienda, quinta, viñedo, cenote, isla privada", orden: 7 },
  // ── PROYECTOS ESPECIALIZADOS ───────────────────────────────────────────────
  { id: 49, verticalId: 8, nombre: "Proyecto Vertical Mixto", descripcion: "Torre que combina residencial, comercial y oficinas", orden: 1 },
  { id: 50, verticalId: 8, nombre: "Distrito Urbano Planeado", descripcion: "Polígono metropolitano de usos múltiples", orden: 2 },
  { id: 51, verticalId: 8, nombre: "Data Center Enterprise", descripcion: "Búnker para servidores masivos. Tier I-IV", orden: 3 },
  { id: 52, verticalId: 8, nombre: "Data Center Colocation", descripcion: "Espacio compartido con refrigeración y energía por tercero", orden: 4 },
  { id: 53, verticalId: 8, nombre: "Campus Educativo", descripcion: "Escuela, universidad o centro de capacitación", orden: 5 },
];

/**
 * Árbol de fallback v2.0 con Segmento = NSE/Mercado
 * Referencia: SHF/CONAVI (Residencial), CBRE/JLL (Oficinas), AMPIP (Industrial),
 *             SECTUR (Hospitalidad), COFEPRIS (Salud)
 */
export const TAXONOMY_FALLBACK: TaxonomyTree = {
  verticals: [
    {
      id: 1, nombre: "Residencial", descripcion: "Propiedades para uso habitacional", icono: "home", activo: true,
      segments: [
        {
          id: 1, verticalId: 1, nombre: "Interés Social / Popular", activo: true,
          descripcion: "Hasta 200 UMAs (~$687K MXN). Subsidios CONAVI. Fraccionamientos masivos.",
          subsegments: [
            { id: 1, segmentId: 1, nombre: "Vivienda Progresiva", descripcion: "Vivienda mínima ampliable por autoconstrucción", activo: true },
            { id: 2, segmentId: 1, nombre: "Unidad Habitacional", descripcion: "Conjunto de departamentos en unidad habitacional pública", activo: true },
          ],
        },
        {
          id: 2, verticalId: 1, nombre: "Económico", activo: true,
          descripcion: "~$400K–$1.2M MXN. INFONAVIT/FOVISSSTE. Primer acceso al crédito.",
          subsegments: [
            { id: 3, segmentId: 2, nombre: "Casa en Serie", descripcion: "Vivienda utilitaria en fraccionamiento masivo", activo: true },
            { id: 4, segmentId: 2, nombre: "Departamento Económico", descripcion: "Departamento en edificio de construcción en serie", activo: true },
          ],
        },
        {
          id: 3, verticalId: 1, nombre: "Medio / Tradicional", activo: true,
          descripcion: "200-750 UMAs. ~$1.2M–$2.5M MXN. Clase media. 2-3 recámaras.",
          subsegments: [
            { id: 5, segmentId: 3, nombre: "Casa en Fraccionamiento", descripcion: "Casa en fraccionamiento privado con servicios completos", activo: true },
            { id: 6, segmentId: 3, nombre: "Departamento Medio", descripcion: "Departamento en edificio de calidad media", activo: true },
            { id: 7, segmentId: 3, nombre: "Townhouse Medio", descripcion: "Casa adosada en conjunto privado", activo: true },
          ],
        },
        {
          id: 4, verticalId: 1, nombre: "Residencial", activo: true,
          descripcion: "750-1500 UMAs. ~$2.5M–$5.1M MXN. Alta plusvalía, amenidades.",
          subsegments: [
            { id: 8, segmentId: 4, nombre: "Casa en Coto Privado", descripcion: "Casa en privada con seguridad y amenidades", activo: true },
            { id: 9, segmentId: 4, nombre: "Departamento Premium", descripcion: "Departamento con acabados de calidad superior", activo: true },
            { id: 10, segmentId: 4, nombre: "Townhouse Residencial", descripcion: "Casa adosada con diseño arquitectónico cuidado", activo: true },
          ],
        },
        {
          id: 5, verticalId: 1, nombre: "Residencial PLUS", activo: true,
          descripcion: "1500-3000 UMAs. >$5.1M MXN. >225 m², diseño personalizado.",
          subsegments: [
            { id: 11, segmentId: 5, nombre: "Casa de Autor", descripcion: "Diseño personalizado, superficies >225 m²", activo: true },
            { id: 12, segmentId: 5, nombre: "Penthouse PLUS", descripcion: "Penthouse con terraza amplia y amenidades exclusivas", activo: true },
            { id: 13, segmentId: 5, nombre: "Garden House PLUS", descripcion: "Planta baja con jardín privado de gran extensión", activo: true },
          ],
        },
        {
          id: 6, verticalId: 1, nombre: "Lujo / Ultra-Lujo", activo: true,
          descripcion: ">3000 UMAs. >$15M MXN. Acabados importados, domótica, ubicación trofeo.",
          subsegments: [
            { id: 14, segmentId: 6, nombre: "Mansión", descripcion: "Residencia >500 m², domótica, ubicación trofeo", activo: true },
            { id: 15, segmentId: 6, nombre: "Villa de Lujo", descripcion: "Villa con alberca privada, jardín y acabados importados", activo: true },
            { id: 16, segmentId: 6, nombre: "Penthouse Ultra-Lujo", descripcion: "Penthouse en edificio icónico, concierge", activo: true },
          ],
        },
      ],
    },
    {
      id: 2, nombre: "Comercial", descripcion: "Propiedades para comercio y retail", icono: "store", activo: true,
      segments: [
        {
          id: 7, verticalId: 2, nombre: "Comercio a Pie de Calle", activo: true,
          descripcion: "Street Retail. Locales en planta baja, alta intensidad peatonal.",
          subsegments: [
            { id: 17, segmentId: 7, nombre: "Local en Corredor Comercial", descripcion: "Alta densidad peatonal, zona consolidada", activo: true },
            { id: 18, segmentId: 7, nombre: "Local en Colonia", descripcion: "Comercio de barrio, baja renta", activo: true },
          ],
        },
        {
          id: 8, verticalId: 2, nombre: "Centros Comerciales", activo: true,
          descripcion: "Malls, lifestyle centers, power centers. GLA, NOI, Cap Rate.",
          subsegments: [
            { id: 19, segmentId: 8, nombre: "Mall / Centro Comercial", descripcion: "Tienda ancla + inline stores + food court", activo: true },
            { id: 20, segmentId: 8, nombre: "Lifestyle Center", descripcion: "Formato abierto, gastronomía y entretenimiento", activo: true },
            { id: 21, segmentId: 8, nombre: "Power Center", descripcion: "Big box stores, alta densidad vehicular", activo: true },
          ],
        },
        {
          id: 9, verticalId: 2, nombre: "Plazas de Conveniencia", activo: true,
          descripcion: "Strip Malls. Comercio de barrio para ~5,000 habitantes.",
          subsegments: [
            { id: 22, segmentId: 9, nombre: "Strip Mall", descripcion: "Formato lineal, locales de 50-200 m²", activo: true },
            { id: 23, segmentId: 9, nombre: "Plaza de Barrio", descripcion: "Supermercado + farmacia + servicios", activo: true },
          ],
        },
        {
          id: 10, verticalId: 2, nombre: "Restaurantes y F&B", activo: true,
          descripcion: "Espacios especializados. Extracción de humos, trampa de grasa.",
          subsegments: [
            { id: 24, segmentId: 10, nombre: "Restaurante Full Service", descripcion: "Comedor completo, cocina certificada", activo: true },
            { id: 25, segmentId: 10, nombre: "Dark Kitchen", descripcion: "Solo delivery, sin área de comensales", activo: true },
            { id: 26, segmentId: 10, nombre: "Food Hall", descripcion: "Múltiples operadores en espacio compartido", activo: true },
          ],
        },
      ],
    },
    {
      id: 3, nombre: "Oficinas", descripcion: "Espacios de trabajo corporativos y flexibles", icono: "building-2", activo: true,
      segments: [
        {
          id: 11, verticalId: 3, nombre: "Clase A+ / A", activo: true,
          descripcion: "Rascacielos premium. Reforma, Polanco. LEED Platino/Oro. Core Factor <15%.",
          subsegments: [
            { id: 27, segmentId: 11, nombre: "Torre Corporativa A+", descripcion: "Rascacielos icónico, LEED Platino/Oro", activo: true },
            { id: 28, segmentId: 11, nombre: "Edificio Clase A", descripcion: "Edificio corporativo premium con certificación", activo: true },
          ],
        },
        {
          id: 12, verticalId: 3, nombre: "Clase B", activo: true,
          descripcion: "Buena calidad, corredores secundarios. Empresas medianas.",
          subsegments: [
            { id: 29, segmentId: 12, nombre: "Edificio Clase B", descripcion: "Edificio de buena calidad en corredor secundario", activo: true },
          ],
        },
        {
          id: 13, verticalId: 3, nombre: "Clase C", activo: true,
          descripcion: "Espacios básicos. Edificios adaptados. Startups y PYMES.",
          subsegments: [
            { id: 30, segmentId: 13, nombre: "Edificio Clase C", descripcion: "Edificio adaptado, infraestructura básica", activo: true },
          ],
        },
        {
          id: 14, verticalId: 3, nombre: "Coworking / Flex", activo: true,
          descripcion: "Oficinas modulares, hot desking. Contratos mensuales.",
          subsegments: [
            { id: 31, segmentId: 14, nombre: "Coworking Compartido", descripcion: "Hot desking, escritorios compartidos", activo: true },
            { id: 32, segmentId: 14, nombre: "Oficina Privada Flex", descripcion: "Oficina privada en edificio de coworking", activo: true },
          ],
        },
      ],
    },
    {
      id: 4, nombre: "Industrial", descripcion: "Naves, bodegas y parques industriales", icono: "factory", activo: true,
      segments: [
        {
          id: 15, verticalId: 4, nombre: "Clase A (AMPIP)", activo: true,
          descripcion: "Tilt-up. Clear height ≥9.75m. MR-35/MR-42. Parque certificado AMPIP.",
          subsegments: [
            { id: 33, segmentId: 15, nombre: "Nave Logística Clase A", descripcion: "Tilt-up, clear height ≥9.75m, andenes hidráulicos", activo: true },
            { id: 34, segmentId: 15, nombre: "Nave de Manufactura Clase A", descripcion: "Ensamblaje automotriz, aeroespacial, metalmecánica", activo: true },
            { id: 35, segmentId: 15, nombre: "Cold Storage", descripcion: "Almacenamiento frigorífico certificado", activo: true },
            { id: 36, segmentId: 15, nombre: "Parque Industrial Certificado", descripcion: "Polígono AMPIP con infraestructura completa", activo: true },
          ],
        },
        {
          id: 16, verticalId: 4, nombre: "Clase B", activo: true,
          descripcion: "Sistemas híbridos. Clear height 6-9m. Sin certificación AMPIP.",
          subsegments: [
            { id: 37, segmentId: 16, nombre: "Nave Logística Clase B", descripcion: "Almacén funcional, clear height 6-9m", activo: true },
            { id: 38, segmentId: 16, nombre: "Nave de Manufactura Clase B", descripcion: "Manufactura ligera o mediana", activo: true },
          ],
        },
        {
          id: 17, verticalId: 4, nombre: "Clase C", activo: true,
          descripcion: "Instalaciones antiguas. Techo <6m. Sin andenes deprimidos.",
          subsegments: [
            { id: 39, segmentId: 17, nombre: "Bodega Clase C", descripcion: "Instalación antigua, techo bajo <6m", activo: true },
            { id: 40, segmentId: 17, nombre: "Nave Clase C", descripcion: "Nave obsoleta para logística básica", activo: true },
          ],
        },
      ],
    },
    {
      id: 5, nombre: "Hospitalidad", descripcion: "Hoteles, resorts y alojamiento turístico", icono: "hotel", activo: true,
      segments: [
        {
          id: 18, verticalId: 5, nombre: "5 Estrellas", activo: true,
          descripcion: "Lujo. Múltiples F&B, spa, convenciones. Marriott, Hilton, Hyatt.",
          subsegments: [
            { id: 41, segmentId: 18, nombre: "Gran Hotel Urbano", descripcion: "Hotel de lujo en ciudad, múltiples F&B, spa", activo: true },
            { id: 42, segmentId: 18, nombre: "Resort de Playa 5*", descripcion: "Resort todo incluido en destino premium", activo: true },
          ],
        },
        {
          id: 19, verticalId: 5, nombre: "4 Estrellas", activo: true,
          descripcion: "Alta calidad. Restaurante, alberca, business center.",
          subsegments: [
            { id: 43, segmentId: 19, nombre: "Hotel Business 4*", descripcion: "Hotel corporativo con business center", activo: true },
          ],
        },
        {
          id: 20, verticalId: 5, nombre: "3 Estrellas", activo: true,
          descripcion: "Servicios estándar. Viajero de negocios y turismo familiar.",
          subsegments: [
            { id: 44, segmentId: 20, nombre: "Hotel Estándar 3*", descripcion: "Servicios completos, precio accesible", activo: true },
          ],
        },
        {
          id: 21, verticalId: 5, nombre: "Sin Categoría / Alternativo", activo: true,
          descripcion: "Glamping, eco-lodge, hostales, alojamiento no clasificado SECTUR.",
          subsegments: [
            { id: 45, segmentId: 21, nombre: "Boutique Hotel", descripcion: "<50 habitaciones, diseño de autor", activo: true },
            { id: 46, segmentId: 21, nombre: "Glamping / Eco-Lodge", descripcion: "Domos, tiendas safari, alojamiento en naturaleza", activo: true },
            { id: 47, segmentId: 21, nombre: "Hostal", descripcion: "Dormitorios compartidos, turismo joven", activo: true },
          ],
        },
      ],
    },
    {
      id: 6, nombre: "Salud", descripcion: "Clínicas, hospitales y consultorios", icono: "heart-pulse", activo: true,
      segments: [
        {
          id: 22, verticalId: 6, nombre: "Atención Primaria", activo: true,
          descripcion: "Consultorios. Licencia Sanitaria COFEPRIS.",
          subsegments: [
            { id: 48, segmentId: 22, nombre: "Consultorio General", descripcion: "Atención médica básica", activo: true },
            { id: 49, segmentId: 22, nombre: "Consultorio de Especialidad", descripcion: "Odontología, nutriología, oftalmología", activo: true },
          ],
        },
        {
          id: 23, verticalId: 6, nombre: "Atención Ambulatoria", activo: true,
          descripcion: "Clínicas de procedimientos, hemodiálisis, cirugía de corta estancia.",
          subsegments: [
            { id: 50, segmentId: 23, nombre: "Clínica Ambulatoria", descripcion: "Procedimientos sin hospitalización", activo: true },
            { id: 51, segmentId: 23, nombre: "Centro de Diagnóstico", descripcion: "Laboratorio, imagen, patología", activo: true },
          ],
        },
        {
          id: 24, verticalId: 6, nombre: "Hospitalización", activo: true,
          descripcion: "Hospitales generales y de alta especialidad. NOM-197-SSA1.",
          subsegments: [
            { id: 52, segmentId: 24, nombre: "Hospital General", descripcion: "Urgencias, hospitalización, quirófanos", activo: true },
            { id: 53, segmentId: 24, nombre: "Hospital de Alta Especialidad", descripcion: "Oncología, cardiología, trasplantes", activo: true },
          ],
        },
        {
          id: 25, verticalId: 6, nombre: "Cuidado Especializado", activo: true,
          descripcion: "Residencias de adultos mayores, Assisted Living, Memory Care.",
          subsegments: [
            { id: 54, segmentId: 25, nombre: "Residencia de Adultos Mayores", descripcion: "Assisted Living, cuidado 24/7", activo: true },
            { id: 55, segmentId: 25, nombre: "Memory Care", descripcion: "Cuidado especializado para demencia/Alzheimer", activo: true },
          ],
        },
      ],
    },
    {
      id: 7, nombre: "Terrenos / Rural", descripcion: "Terrenos, lotes y propiedades rurales", icono: "map", activo: true,
      segments: [
        {
          id: 26, verticalId: 7, nombre: "Suelo Urbano", activo: true,
          descripcion: "Lotes en zonas consolidadas. Uso H, CU, CRU, I según PDU.",
          subsegments: [
            { id: 56, segmentId: 26, nombre: "Lote Residencial Urbano", descripcion: "Lote en colonia o fraccionamiento consolidado", activo: true },
            { id: 57, segmentId: 26, nombre: "Lote Comercial Urbano", descripcion: "Lote en corredor comercial o zona de equipamiento", activo: true },
            { id: 58, segmentId: 26, nombre: "Lote Industrial Urbano", descripcion: "Lote en zona industrial urbana", activo: true },
          ],
        },
        {
          id: 27, verticalId: 7, nombre: "Suelo de Expansión", activo: true,
          descripcion: "Macrolotes en zonas de crecimiento urbano.",
          subsegments: [
            { id: 59, segmentId: 27, nombre: "Macrolote para Desarrollo", descripcion: "Polígono para fraccionamiento o desarrollo", activo: true },
          ],
        },
        {
          id: 28, verticalId: 7, nombre: "Suelo Agrícola", activo: true,
          descripcion: "Tierras de riego con derechos CONAGUA o de temporal.",
          subsegments: [
            { id: 60, segmentId: 28, nombre: "Tierra de Riego", descripcion: "Con derechos CONAGUA, pozos registrados", activo: true },
            { id: 61, segmentId: 28, nombre: "Tierra de Temporal", descripcion: "Dependiente de precipitación pluvial", activo: true },
          ],
        },
        {
          id: 29, verticalId: 7, nombre: "Rural de Nicho / Ecoturístico", activo: true,
          descripcion: "Haciendas, viñedos, cenotes, islas. Agroturismo y enoturismo.",
          subsegments: [
            { id: 62, segmentId: 29, nombre: "Hacienda / Casco", descripcion: "Propiedad patrimonial colonial restaurada", activo: true },
            { id: 63, segmentId: 29, nombre: "Viñedo / Quinta", descripcion: "Propiedad para agroturismo o enoturismo", activo: true },
            { id: 64, segmentId: 29, nombre: "Cenote / Isla", descripcion: "Formación geológica única o isla privada", activo: true },
          ],
        },
      ],
    },
    {
      id: 8, nombre: "Proyectos Especializados", descripcion: "Desarrollos especiales y usos mixtos", icono: "cpu", activo: true,
      segments: [
        {
          id: 30, verticalId: 8, nombre: "Usos Mixtos", activo: true,
          descripcion: "Megatorres y distritos que combinan residencial, comercial, oficinas.",
          subsegments: [
            { id: 65, segmentId: 30, nombre: "Proyecto Vertical Mixto", descripcion: "Torre con usos mixtos en altura", activo: true },
            { id: 66, segmentId: 30, nombre: "Distrito Urbano Planeado", descripcion: "Polígono metropolitano de usos múltiples", activo: true },
          ],
        },
        {
          id: 31, verticalId: 8, nombre: "Infraestructura Tecnológica", activo: true,
          descripcion: "Data Centers Tier I-IV. PUE, kW/rack, Carrier Neutral.",
          subsegments: [
            { id: 67, segmentId: 31, nombre: "Data Center Tier I", descripcion: "99.671% disponibilidad", activo: true },
            { id: 68, segmentId: 31, nombre: "Data Center Tier II", descripcion: "99.741% disponibilidad, redundancia N+1", activo: true },
            { id: 69, segmentId: 31, nombre: "Data Center Tier III", descripcion: "99.982% disponibilidad, mantenimiento concurrente", activo: true },
            { id: 70, segmentId: 31, nombre: "Data Center Tier IV", descripcion: "99.995% disponibilidad, tolerancia total a fallos", activo: true },
          ],
        },
        {
          id: 32, verticalId: 8, nombre: "Educativo / Institucional", activo: true,
          descripcion: "Escuelas, universidades, centros de capacitación, recintos religiosos.",
          subsegments: [
            { id: 71, segmentId: 32, nombre: "Campus Educativo", descripcion: "Escuela, universidad o centro de capacitación", activo: true },
          ],
        },
      ],
    },
  ],
};

// Atributos de filtro por subsegmento (fallback estático)
export const DYNAMIC_FILTER_ATTRIBUTES: Record<number, TaxAttribute[]> = {
  // Residencial Medio/Residencial/PLUS - Casa
  5: [
    { id: 101, nombre: "Habitaciones", clave: "habitaciones", tipoDato: "integer", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 1 },
    { id: 102, nombre: "Baños", clave: "banios", tipoDato: "decimal", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 2 },
    { id: 103, nombre: "Estacionamientos", clave: "estacionamientos", tipoDato: "integer", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 3 },
    { id: 201, nombre: "Niveles", clave: "niveles", tipoDato: "integer", opcionesEnum: null, esGlobal: false, subsegmentId: 5, requerido: false, unidad: null, orden: 4 },
    { id: 202, nombre: "Jardín", clave: "jardin", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 5, requerido: false, unidad: null, orden: 5 },
    { id: 203, nombre: "Alberca", clave: "alberca", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 5, requerido: false, unidad: null, orden: 6 },
  ],
  8: [
    { id: 101, nombre: "Habitaciones", clave: "habitaciones", tipoDato: "integer", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 1 },
    { id: 102, nombre: "Baños", clave: "banios", tipoDato: "decimal", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 2 },
    { id: 103, nombre: "Estacionamientos", clave: "estacionamientos", tipoDato: "integer", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 3 },
    { id: 201, nombre: "Niveles", clave: "niveles", tipoDato: "integer", opcionesEnum: null, esGlobal: false, subsegmentId: 8, requerido: false, unidad: null, orden: 4 },
    { id: 202, nombre: "Jardín", clave: "jardin", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 8, requerido: false, unidad: null, orden: 5 },
    { id: 203, nombre: "Alberca", clave: "alberca", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 8, requerido: false, unidad: null, orden: 6 },
  ],
  // Residencial - Departamento (subsegmentos 4, 9, 12)
  4: [
    { id: 101, nombre: "Habitaciones", clave: "habitaciones", tipoDato: "integer", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 1 },
    { id: 102, nombre: "Baños", clave: "banios", tipoDato: "decimal", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 2 },
    { id: 103, nombre: "Estacionamientos", clave: "estacionamientos", tipoDato: "integer", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 3 },
    { id: 210, nombre: "Piso", clave: "piso", tipoDato: "integer", opcionesEnum: null, esGlobal: false, subsegmentId: 4, requerido: false, unidad: null, orden: 4 },
    { id: 211, nombre: "Elevador", clave: "elevador", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 4, requerido: false, unidad: null, orden: 5 },
  ],
  9: [
    { id: 101, nombre: "Habitaciones", clave: "habitaciones", tipoDato: "integer", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 1 },
    { id: 102, nombre: "Baños", clave: "banios", tipoDato: "decimal", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 2 },
    { id: 103, nombre: "Estacionamientos", clave: "estacionamientos", tipoDato: "integer", opcionesEnum: null, esGlobal: true, subsegmentId: null, requerido: false, unidad: null, orden: 3 },
    { id: 210, nombre: "Piso", clave: "piso", tipoDato: "integer", opcionesEnum: null, esGlobal: false, subsegmentId: 9, requerido: false, unidad: null, orden: 4 },
    { id: 211, nombre: "Elevador", clave: "elevador", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 9, requerido: false, unidad: null, orden: 5 },
    { id: 212, nombre: "Amenidades", clave: "amenidades", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 9, requerido: false, unidad: null, orden: 6 },
  ],
  // Industrial Clase A - Nave Logística
  33: [
    { id: 104, nombre: "Altura libre (m)", clave: "altura_libre", tipoDato: "decimal", opcionesEnum: null, esGlobal: false, subsegmentId: 33, requerido: false, unidad: "m", orden: 1 },
    { id: 105, nombre: "Andenes de carga", clave: "andenes_carga", tipoDato: "integer", opcionesEnum: null, esGlobal: false, subsegmentId: 33, requerido: false, unidad: null, orden: 2 },
    { id: 106, nombre: "Piso industrial", clave: "piso_industrial", tipoDato: "enum", opcionesEnum: ["Concreto armado", "Epóxico", "Asfalto"], esGlobal: false, subsegmentId: 33, requerido: false, unidad: null, orden: 3 },
    { id: 107, nombre: "Clase AMPIP", clave: "clase_ampip", tipoDato: "enum", opcionesEnum: ["Clase A", "Clase A+"], esGlobal: false, subsegmentId: 33, requerido: false, unidad: null, orden: 4 },
  ],
  // Industrial Clase A - Nave Manufactura
  34: [
    { id: 104, nombre: "Altura libre (m)", clave: "altura_libre", tipoDato: "decimal", opcionesEnum: null, esGlobal: false, subsegmentId: 34, requerido: false, unidad: "m", orden: 1 },
    { id: 108, nombre: "Cap. carga (ton/m²)", clave: "capacidad_carga", tipoDato: "decimal", opcionesEnum: null, esGlobal: false, subsegmentId: 34, requerido: false, unidad: "ton/m²", orden: 2 },
    { id: 109, nombre: "Suministro (kVA)", clave: "suministro_electrico", tipoDato: "integer", opcionesEnum: null, esGlobal: false, subsegmentId: 34, requerido: false, unidad: "kVA", orden: 3 },
  ],
  // Oficinas Clase A+/A - Torre
  27: [
    { id: 110, nombre: "Clase de edificio", clave: "clase_edificio", tipoDato: "enum", opcionesEnum: ["Clase A+", "Clase A"], esGlobal: false, subsegmentId: 27, requerido: false, unidad: null, orden: 1 },
    { id: 111, nombre: "Planta privativa", clave: "plantas_privativas", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 27, requerido: false, unidad: null, orden: 2 },
    { id: 112, nombre: "Cert. LEED", clave: "certificacion_leed", tipoDato: "boolean", opcionesEnum: null, esGlobal: false, subsegmentId: 27, requerido: false, unidad: null, orden: 3 },
    { id: 113, nombre: "Core Factor (%)", clave: "core_factor", tipoDato: "decimal", opcionesEnum: null, esGlobal: false, subsegmentId: 27, requerido: false, unidad: "%", orden: 4 },
  ],
  // Comercial - Local en Corredor
  17: [
    { id: 114, nombre: "Frente (m)", clave: "frente_local", tipoDato: "decimal", opcionesEnum: null, esGlobal: false, subsegmentId: 17, requerido: false, unidad: "m", orden: 1 },
    { id: 115, nombre: "Uso de suelo", clave: "uso_suelo", tipoDato: "enum", opcionesEnum: ["CU", "CRU", "CS"], esGlobal: false, subsegmentId: 17, requerido: false, unidad: null, orden: 2 },
  ],
};

// ─── Mapa de filtrado por tipo de uso ─────────────────────────────────────────

const VERTICAL_IDS_BY_USO: Record<number, number[]> = {
  1: [1, 5, 7],        // Residencial: Residencial + Hospitalidad + Terrenos
  2: [2, 3, 6, 8],     // Comercial: Comercial + Oficinas + Salud + Especializados
  3: [4, 7],           // Industrial: Industrial + Terrenos
  4: [],               // Mixto: sin restricción (array vacío = mostrar todas)
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTaxonomy(options?: UseTaxonomyOptions): UseTaxonomyReturn {
  const [tree, setTree] = useState<TaxonomyTree>(TAXONOMY_FALLBACK);
  const [isLoading, setIsLoading] = useState(false);
  const [tipologias, setTipologias] = useState<TaxTipologia[]>(FALLBACK_TIPOLOGIAS);
  const [selection, setSelection] = useState<TaxonomySelection>({
    verticalId: options?.verticalId ?? null,
    tipologiaId: options?.tipologiaId ?? null,
    segmentId: options?.segmentId ?? null,
    subsegmentId: options?.subsegmentId ?? null,
  });
  const tipoUso = options?.tipoUso ?? null;
  const [dynamicAttributes, setDynamicAttributes] = useState<TaxAttribute[]>([]);

  // Cargar árbol desde el Brain (con fallback al estático)
  useEffect(() => {
    const loadTree = async () => {
      setIsLoading(true);
      try {
        // Proxy server-side → evita CORS con ml.homepty.com
        const res = await fetch("/api/brain/taxonomy?action=getTree");
        if (res.ok) {
          const brainTree = await res.json();
          if (brainTree.verticals?.length > 0) {
            setTree(brainTree);
          }
        }
      } catch {
        // Usar fallback silenciosamente
      } finally {
        setIsLoading(false);
      }
    };
    loadTree();
  }, []);

  // Cargar atributos dinámicos cuando cambia el subsegmento
  useEffect(() => {
    if (!selection.subsegmentId) {
      setDynamicAttributes([]);
      return;
    }

    const loadAttributes = async () => {
      try {
        // Proxy server-side → evita CORS con ml.homepty.com
        const res = await fetch(`/api/brain/taxonomy?action=getAttributes&subsegmentId=${selection.subsegmentId}`);
        if (res.ok) {
          const attrs = await res.json();
          const allAttrs = [...(attrs.global ?? []), ...(attrs.specialized ?? [])];
          if (allAttrs.length > 0) {
            setDynamicAttributes(allAttrs);
            return;
          }
        }
      } catch {
        // Fallback al estático
      }
      const fallbackAttrs = DYNAMIC_FILTER_ATTRIBUTES[selection.subsegmentId!] ?? [];
      setDynamicAttributes(fallbackAttrs);
    };

    loadAttributes();
  }, [selection.subsegmentId]);

  // Verticales disponibles (filtradas por tipoUso)
  const allowedVerticalIds = tipoUso !== null && tipoUso !== undefined
    ? (VERTICAL_IDS_BY_USO[tipoUso] ?? [])
    : [];
  const availableVerticals = tree.verticals.filter(v =>
    v.activo !== false &&
    (allowedVerticalIds.length === 0 || allowedVerticalIds.includes(v.id))
  );

  // Tipologías disponibles según la vertical seleccionada (v2.0)
  const availableTipologias = useMemo(() => {
    if (!selection.verticalId) return [];
    return tipologias
      .filter(t => t.verticalId === selection.verticalId)
      .sort((a, b) => a.orden - b.orden);
  }, [tipologias, selection.verticalId]);

  // Segmentos disponibles según la vertical seleccionada
  const availableSegments = selection.verticalId
    ? (tree.verticals.find(v => v.id === selection.verticalId)?.segments ?? []).filter(s => s.activo !== false)
    : [];

  // Subsegmentos disponibles según el segmento seleccionado
  const availableSubsegments = selection.segmentId
    ? (availableSegments.find(s => s.id === selection.segmentId)?.subsegments ?? []).filter(ss => ss.activo !== false)
    : [];

  // Entidades seleccionadas
  const selectedVertical = availableVerticals.find(v => v.id === selection.verticalId) ?? null;
  const selectedTipologia = availableTipologias.find(t => t.id === selection.tipologiaId) ?? null;
  const selectedSegment = availableSegments.find(s => s.id === selection.segmentId) ?? null;
  const selectedSubsegment = availableSubsegments.find(ss => ss.id === selection.subsegmentId) ?? null;

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    const parts: string[] = [];
    if (selectedVertical) parts.push(selectedVertical.nombre);
    if (selectedTipologia) parts.push(selectedTipologia.nombre);
    if (selectedSegment) parts.push(selectedSegment.nombre);
    if (selectedSubsegment) parts.push(selectedSubsegment.nombre);
    return parts.join(" › ");
  }, [selectedVertical, selectedTipologia, selectedSegment, selectedSubsegment]);

  // Acciones
  const selectVertical = useCallback((verticalId: number | null) => {
    setSelection({ verticalId, tipologiaId: null, segmentId: null, subsegmentId: null });
    setDynamicAttributes([]);
  }, []);

  const selectTipologia = useCallback((tipologiaId: number | null) => {
    setSelection(prev => ({ ...prev, tipologiaId }));
  }, []);

  const selectSegment = useCallback((segmentId: number | null) => {
    setSelection(prev => ({ ...prev, segmentId, subsegmentId: null }));
    setDynamicAttributes([]);
  }, []);

  const selectSubsegment = useCallback((subsegmentId: number | null) => {
    setSelection(prev => ({ ...prev, subsegmentId }));
  }, []);

  const reset = useCallback(() => {
    setSelection({ verticalId: null, tipologiaId: null, segmentId: null, subsegmentId: null });
    setDynamicAttributes([]);
  }, []);

  return {
    tree,
    isLoading,
    selection,
    availableVerticals,
    availableTipologias,
    availableSegments,
    availableSubsegments,
    dynamicAttributes,
    selectVertical,
    selectTipologia,
    selectSegment,
    selectSubsegment,
    reset,
    selectedVertical,
    selectedTipologia,
    selectedSegment,
    selectedSubsegment,
    breadcrumb,
  };
}
