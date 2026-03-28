"use client";
/**
 * TaxonomyStep v2.0 — Paso de Clasificación Taxonómica
 *
 * ARQUITECTURA CORREGIDA (SHF / CONAVI / CANADEVI / AMPIP / SECTUR):
 *
 *   Vertical (¿qué tipo de mercado inmobiliario?)
 *     ├── Tipología (¿qué forma física tiene el inmueble?)   ← TRANSVERSAL al NSE
 *     │     Ejemplo: "Departamento" puede ser Económico o Lujo
 *     │
 *     └── Segmento (¿a qué nivel socioeconómico/mercado pertenece?)
 *           └── Subsegmento (especialización dentro del segmento)
 *
 * La Tipología responde a la pregunta estructural: ¿Qué es físicamente el inmueble?
 * El Segmento responde a la pregunta de mercado: ¿A qué NSE/mercado pertenece?
 *
 * Integración con react-hook-form via useFormContext.
 * Fallback estático completo — no requiere Brain API.
 */
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import type { TaxAttribute } from "@/lib/brain-client";

// ============================================================
// TIPOS
// ============================================================
export interface TaxonomyFormData {
  taxonomy_vertical_id?: number | null;
  taxonomy_tipologia_id?: number | null;   // v2.0: Forma físico-estructural (transversal al NSE)
  taxonomy_segment_id?: number | null;
  taxonomy_subsegment_id?: number | null;
  taxonomy_attributes?: Record<string, string>;
}

interface TaxonomyStepProps {
  /**
   * id_tipo_uso de la BD. Cuando se provee, filtra las verticales disponibles.
   * 1 = Residencial, 2 = Comercial, 3 = Industrial, 4 = Mixto (sin filtro).
   * Si no se provee, se muestran todas las verticales.
   */
  tipoUso?: number | null;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export function TaxonomyStep({ tipoUso }: TaxonomyStepProps = {}) {
  const { setValue, watch } = useFormContext<TaxonomyFormData>();
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});

  const watchedVertical = watch("taxonomy_vertical_id");
  const watchedTipologia = watch("taxonomy_tipologia_id");
  const watchedSegment = watch("taxonomy_segment_id");
  const watchedSubsegment = watch("taxonomy_subsegment_id");

  const {
    availableVerticals,
    availableTipologias,
    availableSegments,
    availableSubsegments,
    selection,
    selectVertical,
    selectTipologia,
    selectSegment,
    selectSubsegment,
    dynamicAttributes,
    selectedVertical,
    selectedTipologia,
    selectedSegment,
    selectedSubsegment,
    isLoading,
  } = useTaxonomy({
    verticalId: watchedVertical ?? null,
    tipologiaId: watchedTipologia ?? null,
    segmentId: watchedSegment ?? null,
    subsegmentId: watchedSubsegment ?? null,
    tipoUso: tipoUso ?? null,
  });

  // ---- Handlers de selección ----
  const handleVerticalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectVertical(value);
    setValue("taxonomy_vertical_id", value);
    setValue("taxonomy_tipologia_id", null);
    setValue("taxonomy_segment_id", null);
    setValue("taxonomy_subsegment_id", null);
    setValue("taxonomy_attributes", {});
    setAttrValues({});
  };

  const handleTipologiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectTipologia(value);
    setValue("taxonomy_tipologia_id", value);
  };

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectSegment(value);
    setValue("taxonomy_segment_id", value);
    setValue("taxonomy_subsegment_id", null);
    setValue("taxonomy_attributes", {});
    setAttrValues({});
  };

  const handleSubsegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectSubsegment(value);
    setValue("taxonomy_subsegment_id", value);
    setValue("taxonomy_attributes", {});
    setAttrValues({});
  };

  const handleAttrChange = (clave: string, value: string) => {
    const newValues = { ...attrValues, [clave]: value };
    setAttrValues(newValues);
    setValue("taxonomy_attributes", newValues);
  };

  // ---- Renderizador de atributo EAV ----
  const renderAttribute = (attr: TaxAttribute) => {
    const currentValue = attrValues[attr.clave] ?? "";

    if (attr.tipoDato === "integer" || attr.tipoDato === "decimal") {
      return (
        <div key={attr.id} className="flex flex-col gap-y-2">
          <Label htmlFor={`tax_attr_${attr.clave}`}>
            {attr.nombre}
            {attr.unidad && (
              <span className="text-muted-foreground text-xs ml-1">({attr.unidad})</span>
            )}
            {attr.requerido && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            type="number"
            id={`tax_attr_${attr.clave}`}
            placeholder={attr.tipoDato === "integer" ? "Ej: 2" : "Ej: 2.5"}
            value={currentValue}
            onChange={(e) => handleAttrChange(attr.clave, e.target.value)}
            step={attr.tipoDato === "decimal" ? "0.5" : "1"}
            min="0"
          />
        </div>
      );
    }

    if (attr.tipoDato === "boolean") {
      return (
        <div key={attr.id} className="flex items-center gap-3 py-2">
          <Checkbox
            id={`tax_attr_${attr.clave}`}
            checked={currentValue === "true"}
            onCheckedChange={(checked) =>
              handleAttrChange(attr.clave, checked ? "true" : "false")
            }
          />
          <Label
            htmlFor={`tax_attr_${attr.clave}`}
            className="font-normal cursor-pointer"
          >
            {attr.nombre}
            {attr.requerido && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
      );
    }

    if (attr.tipoDato === "enum") {
      return (
        <div key={attr.id} className="flex flex-col gap-y-2">
          <Label htmlFor={`tax_attr_${attr.clave}`}>
            {attr.nombre}
            {attr.requerido && <span className="text-destructive ml-1">*</span>}
          </Label>
          <NativeSelect
            id={`tax_attr_${attr.clave}`}
            value={currentValue}
            onChange={(e) => handleAttrChange(attr.clave, e.target.value)}
          >
            <NativeSelectOption value="">Seleccionar...</NativeSelectOption>
            {(attr.opcionesEnum ?? []).map((opt) => (
              <NativeSelectOption key={opt} value={opt}>
                {opt}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      );
    }

    // text (fallback)
    return (
      <div key={attr.id} className="flex flex-col gap-y-2">
        <Label htmlFor={`tax_attr_${attr.clave}`}>
          {attr.nombre}
          {attr.requerido && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          type="text"
          id={`tax_attr_${attr.clave}`}
          placeholder={`Ingresa ${attr.nombre.toLowerCase()}`}
          value={currentValue}
          onChange={(e) => handleAttrChange(attr.clave, e.target.value)}
        />
      </div>
    );
  };

  const globalAttrs = dynamicAttributes.filter((a) => a.esGlobal);
  const specializedAttrs = dynamicAttributes.filter((a) => !a.esGlobal);

  // Etiqueta contextual según el filtro de uso
  const usoLabels: Record<number, string> = {
    1: "Residencial",
    2: "Comercial",
    3: "Industrial",
    4: "Mixto",
  };
  const usoLabel = tipoUso ? usoLabels[tipoUso] : null;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <section className="flex flex-col gap-6">

      {/* ---- Banner informativo ---- */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">
          Clasificación taxonómica
          {usoLabel && (
            <Badge className="ml-2 text-xs bg-blue-600 text-white">{usoLabel}</Badge>
          )}
        </h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          {usoLabel
            ? `Las verticales disponibles están filtradas por el tipo de uso "${usoLabel}" seleccionado en el paso anterior. Esto garantiza coherencia en la clasificación.`
            : "Clasifica tu propiedad para mejorar su visibilidad en el marketplace y activar los atributos especializados correctos."}
        </p>
      </div>

      {/* ---- Breadcrumb de selección ---- */}
      {(selectedVertical || selectedTipologia || selectedSegment || selectedSubsegment) && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedVertical && (
            <Badge variant="secondary" className="text-xs">
              {selectedVertical.nombre}
            </Badge>
          )}
          {selectedTipologia && (
            <>
              <span className="text-muted-foreground text-xs">›</span>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                {selectedTipologia.nombre}
              </Badge>
            </>
          )}
          {selectedSegment && (
            <>
              <span className="text-muted-foreground text-xs">›</span>
              <Badge variant="secondary" className="text-xs">
                {selectedSegment.nombre}
              </Badge>
            </>
          )}
          {selectedSubsegment && (
            <>
              <span className="text-muted-foreground text-xs">›</span>
              <Badge className="text-xs bg-blue-600 text-white">
                {selectedSubsegment.nombre}
              </Badge>
            </>
          )}
        </div>
      )}

      {/* ---- Selectores en cascada ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Vertical */}
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="tax_vertical">
            Vertical inmobiliaria <span className="text-destructive">*</span>
          </Label>
          {isLoading ? (
            <div className="h-9 bg-slate-100 animate-pulse rounded-md" />
          ) : (
            <NativeSelect
              id="tax_vertical"
              value={selection.verticalId?.toString() ?? ""}
              onChange={handleVerticalChange}
            >
              <NativeSelectOption value="" disabled>
                Seleccionar vertical
              </NativeSelectOption>
              {availableVerticals.map((v) => (
                <NativeSelectOption key={v.id} value={v.id.toString()}>
                  {v.nombre}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
          <p className="text-xs text-muted-foreground">Categoría principal del activo</p>
        </div>

        {/* Tipología — Forma físico-estructural (v2.0) */}
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="tax_tipologia">
            Tipología del inmueble
          </Label>
          <NativeSelect
            id="tax_tipologia"
            value={selection.tipologiaId?.toString() ?? ""}
            onChange={handleTipologiaChange}
            disabled={!selection.verticalId || availableTipologias.length === 0}
          >
            <NativeSelectOption value="">
              {!selection.verticalId
                ? "Primero selecciona vertical"
                : "Seleccionar tipología (opcional)"}
            </NativeSelectOption>
            {availableTipologias.map((t) => (
              <NativeSelectOption key={t.id} value={t.id.toString()}>
                {t.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">Forma física del inmueble</p>
        </div>

        {/* Segmento — NSE / Clasificación de Mercado */}
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="tax_segment">
            Segmento de mercado <span className="text-destructive">*</span>
          </Label>
          <NativeSelect
            id="tax_segment"
            value={selection.segmentId?.toString() ?? ""}
            onChange={handleSegmentChange}
            disabled={!selection.verticalId}
          >
            <NativeSelectOption value="" disabled>
              {!selection.verticalId
                ? "Primero selecciona vertical"
                : "Seleccionar segmento"}
            </NativeSelectOption>
            {availableSegments.map((s) => (
              <NativeSelectOption key={s.id} value={s.id.toString()}>
                {s.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">Nivel socioeconómico del activo</p>
        </div>

        {/* Subsegmento */}
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="tax_subsegment">Tipo específico</Label>
          <NativeSelect
            id="tax_subsegment"
            value={selection.subsegmentId?.toString() ?? ""}
            onChange={handleSubsegmentChange}
            disabled={!selection.segmentId}
          >
            <NativeSelectOption value="">
              {!selection.segmentId
                ? "Primero selecciona segmento"
                : "Seleccionar tipo (opcional)"}
            </NativeSelectOption>
            {availableSubsegments.map((ss) => (
              <NativeSelectOption key={ss.id} value={ss.id.toString()}>
                {ss.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">Tipo exacto del activo</p>
        </div>
      </div>

      {/* ---- Atributos especializados ---- */}
      {dynamicAttributes.length > 0 && (
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold">Atributos especializados</h3>
            {selectedSubsegment && (
              <Badge variant="outline" className="text-xs">
                {selectedSubsegment.nombre}
              </Badge>
            )}
          </div>

          {/* Atributos globales */}
          {globalAttrs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {globalAttrs.map(renderAttribute)}
            </div>
          )}

          {/* Separador */}
          {globalAttrs.length > 0 && specializedAttrs.length > 0 && (
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Específicos del tipo
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          )}

          {/* Atributos especializados */}
          {specializedAttrs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {specializedAttrs.map(renderAttribute)}
            </div>
          )}
        </div>
      )}

      {/* ---- Estado vacío ---- */}
      {selection.segmentId && dynamicAttributes.length === 0 && !isLoading && (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Selecciona un tipo específico para ver los atributos especializados
            disponibles para este tipo de activo.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        La clasificación es opcional pero mejora significativamente la precisión
        de valuación y la visibilidad en el marketplace.
      </p>
    </section>
  );
}
