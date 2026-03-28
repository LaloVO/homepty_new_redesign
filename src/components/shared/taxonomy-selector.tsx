"use client";
/**
 * TaxonomySelector
 * Selector en cascada: Vertical > Segmento > Subsegmento
 * Utilizado tanto en el formulario de creación de propiedad
 * como en el modal "Más Filtros" del marketplace.
 *
 * Props:
 * - mode: "create" (formulario de alta) | "filter" (búsqueda/filtros)
 * - onSelectionChange: callback cuando cambia la selección
 * - initialSelection: selección inicial (para edición o filtros activos)
 * - showLabels: mostrar etiquetas (true por defecto)
 * - compact: modo compacto para el header de filtros
 */
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { useTaxonomy, type TaxonomySelection } from "@/hooks/use-taxonomy";

interface TaxonomySelectorProps {
  mode?: "create" | "filter";
  onSelectionChange?: (selection: TaxonomySelection) => void;
  initialSelection?: Partial<TaxonomySelection>;
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
}

export function TaxonomySelector({
  mode = "filter",
  onSelectionChange,
  initialSelection,
  showLabels = true,
  compact = false,
  className = "",
}: TaxonomySelectorProps) {
  const {
    availableVerticals,
    availableSegments,
    availableSubsegments,
    selection,
    selectVertical,
    selectSegment,
    selectSubsegment,
    isLoading,
  } = useTaxonomy(initialSelection ?? {});

  const handleVerticalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectVertical(value);
    onSelectionChange?.({ verticalId: value, tipologiaId: null, segmentId: null, subsegmentId: null });
  };

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectSegment(value);
    onSelectionChange?.({ ...selection, segmentId: value, subsegmentId: null });
  };

  const handleSubsegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectSubsegment(value);
    onSelectionChange?.({ ...selection, subsegmentId: value });
  };

  const selectClass = compact
    ? "h-9 text-sm"
    : "w-full";

  if (isLoading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <div className="h-9 w-40 bg-slate-100 animate-pulse rounded-md" />
        <div className="h-9 w-40 bg-slate-100 animate-pulse rounded-md" />
        <div className="h-9 w-40 bg-slate-100 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className={`flex ${compact ? "flex-row gap-2 items-center" : "flex-col gap-4"} ${className}`}>
      {/* Vertical */}
      <div className={compact ? "" : "flex flex-col gap-y-2"}>
        {showLabels && !compact && <Label htmlFor="tax_vertical">Vertical inmobiliaria</Label>}
        <NativeSelect
          id="tax_vertical"
          className={selectClass}
          value={selection.verticalId?.toString() ?? ""}
          onChange={handleVerticalChange}
        >
          <NativeSelectOption value="">
            {mode === "create" ? "Seleccionar vertical" : "Todas las verticales"}
          </NativeSelectOption>
          {availableVerticals.map((v) => (
            <NativeSelectOption key={v.id} value={v.id.toString()}>
              {v.nombre}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {/* Segmento — solo visible si hay vertical seleccionada */}
      {(selection.verticalId !== null || mode === "create") && (
        <div className={compact ? "" : "flex flex-col gap-y-2"}>
          {showLabels && !compact && <Label htmlFor="tax_segment">Segmento</Label>}
          <NativeSelect
            id="tax_segment"
            className={selectClass}
            value={selection.segmentId?.toString() ?? ""}
            onChange={handleSegmentChange}
            disabled={!selection.verticalId}
          >
            <NativeSelectOption value="">
              {!selection.verticalId
                ? "Primero selecciona vertical"
                : mode === "create"
                ? "Seleccionar segmento"
                : "Todos los segmentos"}
            </NativeSelectOption>
            {availableSegments.map((s) => (
              <NativeSelectOption key={s.id} value={s.id.toString()}>
                {s.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      )}

      {/* Subsegmento — solo visible si hay segmento seleccionado */}
      {(selection.segmentId !== null || mode === "create") && (
        <div className={compact ? "" : "flex flex-col gap-y-2"}>
          {showLabels && !compact && <Label htmlFor="tax_subsegment">Tipo específico</Label>}
          <NativeSelect
            id="tax_subsegment"
            className={selectClass}
            value={selection.subsegmentId?.toString() ?? ""}
            onChange={handleSubsegmentChange}
            disabled={!selection.segmentId}
          >
            <NativeSelectOption value="">
              {!selection.segmentId
                ? "Primero selecciona segmento"
                : mode === "create"
                ? "Seleccionar tipo"
                : "Todos los tipos"}
            </NativeSelectOption>
            {availableSubsegments.map((ss) => (
              <NativeSelectOption key={ss.id} value={ss.id.toString()}>
                {ss.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      )}
    </div>
  );
}
