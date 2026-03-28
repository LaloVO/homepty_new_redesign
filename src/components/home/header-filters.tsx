"use client";
/**
 * HeaderFilters — Barra de filtros del marketplace (Inicio/Explore)
 *
 * Implementa la nueva jerarquía de filtros taxonómica:
 * 1. Tipo de Operación (Venta, Renta, Pre-Venta, etc.)
 * 2. Vertical Inmobiliaria (Residencial, Comercial, Oficinas, Industrial, etc.)
 * 3. Segmento (en cascada según vertical)
 * 4. Subsegmento (en cascada según segmento)
 * 5. Botón "Más Filtros" → abre Sheet con filtros adaptativos por subsegmento
 *
 * El botón "Más Filtros" es ADAPTATIVO: el Sheet que abre muestra
 * los atributos especializados según el tipo de activo seleccionado.
 */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FilterIcon, PlusIcon, XIcon } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TYPES_OF_OPERATIONS } from "@/utils/constants";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { DynamicFilterAttributes } from "./dynamic-filter-attributes";
import Link from "next/link";

export function HeaderFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Estado de la taxonomía en cascada
  const {
    availableVerticals,
    availableSegments,
    availableSubsegments,
    selection,
    selectVertical,
    selectSegment,
    selectSubsegment,
    dynamicAttributes,
    isLoading,
  } = useTaxonomy({
    verticalId: searchParams.get("vertical_id") ? Number(searchParams.get("vertical_id")) : null,
    segmentId: searchParams.get("segment_id") ? Number(searchParams.get("segment_id")) : null,
    subsegmentId: searchParams.get("subsegment_id") ? Number(searchParams.get("subsegment_id")) : null,
  });

  // Contador de filtros activos para el badge del botón
  const activeFilterCount = [
    searchParams.get("precioMin"),
    searchParams.get("precioMax"),
    searchParams.get("areaMin"),
    searchParams.get("areaMax"),
    ...Array.from(searchParams.keys()).filter(k => k.startsWith("attr_")),
  ].filter(Boolean).length;

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleVerticalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectVertical(value);
    const params = new URLSearchParams(searchParams);
    if (value) { params.set("vertical_id", String(value)); } else { params.delete("vertical_id"); }
    params.delete("segment_id");
    params.delete("subsegment_id");
    Array.from(params.keys()).filter(k => k.startsWith("attr_")).forEach(k => params.delete(k));
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectSegment(value);
    const params = new URLSearchParams(searchParams);
    if (value) { params.set("segment_id", String(value)); } else { params.delete("segment_id"); }
    params.delete("subsegment_id");
    Array.from(params.keys()).filter(k => k.startsWith("attr_")).forEach(k => params.delete(k));
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSubsegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    selectSubsegment(value);
    const params = new URLSearchParams(searchParams);
    if (value) { params.set("subsegment_id", String(value)); } else { params.delete("subsegment_id"); }
    Array.from(params.keys()).filter(k => k.startsWith("attr_")).forEach(k => params.delete(k));
    replace(`${pathname}?${params.toString()}`);
  };

  const handleClearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    replace(`${pathname}?${params.toString()}`);
    selectVertical(null);
  };

  const hasActiveFilters = !!(selection.verticalId || selection.segmentId ||
    searchParams.get("type_operation") || activeFilterCount > 0);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Tipo de Operación */}
        <NativeSelect
          className="w-36 h-9 text-sm"
          value={searchParams.get("type_operation")?.toString() ?? ""}
          onChange={(e) => handleFilterChange("type_operation", e.target.value)}
        >
          <NativeSelectOption value="">Operación</NativeSelectOption>
          {TYPES_OF_OPERATIONS.map((op) => (
            <NativeSelectOption key={op.id} value={String(op.value)}>
              {op.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        {/* Vertical Inmobiliaria */}
        {isLoading ? (
          <div className="h-9 w-36 bg-slate-100 animate-pulse rounded-md" />
        ) : (
          <NativeSelect
            className="w-36 h-9 text-sm"
            value={selection.verticalId?.toString() ?? ""}
            onChange={handleVerticalChange}
          >
            <NativeSelectOption value="">Tipo de activo</NativeSelectOption>
            {availableVerticals.map((v) => (
              <NativeSelectOption key={v.id} value={v.id.toString()}>
                {v.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}

        {/* Segmento — visible solo si hay vertical seleccionada */}
        {selection.verticalId && availableSegments.length > 0 && (
          <NativeSelect
            className="w-36 h-9 text-sm"
            value={selection.segmentId?.toString() ?? ""}
            onChange={handleSegmentChange}
          >
            <NativeSelectOption value="">Segmento</NativeSelectOption>
            {availableSegments.map((s) => (
              <NativeSelectOption key={s.id} value={s.id.toString()}>
                {s.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}

        {/* Subsegmento — visible solo si hay segmento seleccionado */}
        {selection.segmentId && availableSubsegments.length > 0 && (
          <NativeSelect
            className="w-40 h-9 text-sm"
            value={selection.subsegmentId?.toString() ?? ""}
            onChange={handleSubsegmentChange}
          >
            <NativeSelectOption value="">Tipo específico</NativeSelectOption>
            {availableSubsegments.map((ss) => (
              <NativeSelectOption key={ss.id} value={ss.id.toString()}>
                {ss.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}

        {/* Botón "Más Filtros" — adaptativo */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 relative"
          onClick={() => setIsMoreFiltersOpen(true)}
        >
          <FilterIcon size={16} />
          <span className="hidden sm:inline">Más Filtros</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleClearAllFilters}
          >
            <XIcon size={14} />
            <span className="hidden sm:inline text-xs">Limpiar</span>
          </Button>
        )}

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        <Button
          asChild
          variant="default"
          size="sm"
          className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
        >
          <Link href="/properties/create">
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Crear</span>
          </Link>
        </Button>
      </div>

      {/* Sheet de "Más Filtros" — ADAPTATIVO */}
      <Sheet open={isMoreFiltersOpen} onOpenChange={setIsMoreFiltersOpen}>
        <SheetContent side="right" className="w-full sm:w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FilterIcon size={18} />
              Más Filtros
              {selection.subsegmentId && (
                <span className="text-sm font-normal text-muted-foreground">
                  — {availableSubsegments.find(ss => ss.id === selection.subsegmentId)?.nombre ?? ""}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-6 mt-6">
            {/* Precio */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Precio (MXN)</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Mínimo</label>
                  <input type="number" className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background"
                    placeholder="Ej: 500,000" value={searchParams.get("precioMin") ?? ""}
                    onChange={(e) => handleFilterChange("precioMin", e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Máximo</label>
                  <input type="number" className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background"
                    placeholder="Ej: 5,000,000" value={searchParams.get("precioMax") ?? ""}
                    onChange={(e) => handleFilterChange("precioMax", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Área */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Área (m²)</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Mínima</label>
                  <input type="number" className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background"
                    placeholder="Ej: 50" value={searchParams.get("areaMin") ?? ""}
                    onChange={(e) => handleFilterChange("areaMin", e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Máxima</label>
                  <input type="number" className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background"
                    placeholder="Ej: 500" value={searchParams.get("areaMax") ?? ""}
                    onChange={(e) => handleFilterChange("areaMax", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Filtros dinámicos adaptativos */}
            {dynamicAttributes.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Características específicas
                </h3>
                <DynamicFilterAttributes attributes={dynamicAttributes} mode="url" />
              </div>
            ) : (
              !selection.subsegmentId && (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Selecciona un tipo específico en la barra de filtros para ver
                    los atributos especializados disponibles.
                  </p>
                </div>
              )
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={handleClearAllFilters}>
                Limpiar filtros
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setIsMoreFiltersOpen(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
