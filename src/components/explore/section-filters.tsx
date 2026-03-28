"use client";
/**
 * SectionFilters — Explore page header with taxonomy v2.0 cascade filters
 * 
 * Mirrors the pattern from HeaderFilters (home):
 * 1. Tipo de Operación
 * 2. Vertical → Segmento → Subsegmento (cascading)
 * 3. "Más Filtros" button → Sheet with dynamic attributes
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, PlusIcon, BellIcon, FilterIcon, XIcon } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { TYPES_OF_OPERATIONS } from "@/utils/constants";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { DynamicFilterAttributes } from "../home/dynamic-filter-attributes";

const AddressAutoComplete = dynamic(
  () => import("@/components/shared/address-autocomplete"),
  { ssr: false }
);

export function SectionFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

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

  const activeFilterCount = [
    searchParams.get("precioMin"),
    searchParams.get("precioMax"),
    searchParams.get("areaMin"),
    searchParams.get("areaMax"),
    ...Array.from(searchParams.keys()).filter(k => k.startsWith("attr_")),
  ].filter(Boolean).length;

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) { params.set(key, value); } else { params.delete(key); }
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
      <header className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm rounded-xl px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 flex-1">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-100/50 rounded-full border border-gray-200 px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full max-w-[320px]">
            <SearchIcon size={18} className="text-gray-400" />
            <AddressAutoComplete>
              <Input
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-700 placeholder-gray-400 p-0 pl-2 h-auto"
                placeholder="Buscar zona, calle o ID..."
                type="text"
              />
            </AddressAutoComplete>
            <span className="text-[10px] text-gray-400 font-mono border border-gray-200 rounded px-1.5 py-0.5 ml-2">
              ⌘K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Operation Type */}
          <NativeSelect
            className="h-8 text-xs font-medium text-gray-600 bg-white border-gray-200 w-28"
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

          {/* Vertical */}
          <NativeSelect
            className="h-8 text-xs font-medium text-gray-600 bg-white border-gray-200 w-28"
            value={selection.verticalId?.toString() ?? ""}
            onChange={handleVerticalChange}
            disabled={isLoading}
          >
            <NativeSelectOption value="">Vertical</NativeSelectOption>
            {availableVerticals.map((v) => (
              <NativeSelectOption key={v.id} value={String(v.id)}>
                {v.nombre}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          {/* Segment (conditional) */}
          {availableSegments.length > 0 && (
            <NativeSelect
              className="h-8 text-xs font-medium text-gray-600 bg-white border-gray-200 w-28"
              value={selection.segmentId?.toString() ?? ""}
              onChange={handleSegmentChange}
            >
              <NativeSelectOption value="">Segmento</NativeSelectOption>
              {availableSegments.map((s) => (
                <NativeSelectOption key={s.id} value={String(s.id)}>
                  {s.nombre}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}

          {/* Subsegment (conditional) */}
          {availableSubsegments.length > 0 && (
            <NativeSelect
              className="h-8 text-xs font-medium text-gray-600 bg-white border-gray-200 w-28"
              value={selection.subsegmentId?.toString() ?? ""}
              onChange={handleSubsegmentChange}
            >
              <NativeSelectOption value="">Subsegmento</NativeSelectOption>
              {availableSubsegments.map((ss) => (
                <NativeSelectOption key={ss.id} value={String(ss.id)}>
                  {ss.nombre}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}

          <div className="border-l border-gray-200 h-6 mx-1" />

          {/* More Filters */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setIsMoreFiltersOpen(true)}
          >
            <FilterIcon size={14} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-gray-500"
              onClick={handleClearAllFilters}
            >
              <XIcon size={14} className="mr-1" />
              Limpiar
            </Button>
          )}

          <div className="border-l border-gray-200 h-6 mx-1" />

          <button className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-indigo-600 rounded-md shadow-sm shadow-indigo-200 transition-all flex items-center gap-1">
            <PlusIcon size={16} /> Nueva
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors relative">
            <BellIcon size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </header>

      {/* More Filters Sheet */}
      <Sheet open={isMoreFiltersOpen} onOpenChange={setIsMoreFiltersOpen}>
        <SheetContent className="w-[380px] sm:w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold">Más Filtros</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Rango de Precio</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Mínimo"
                  className="h-9 text-sm"
                  defaultValue={searchParams.get("precioMin") ?? ""}
                  onChange={(e) => handleFilterChange("precioMin", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Máximo"
                  className="h-9 text-sm"
                  defaultValue={searchParams.get("precioMax") ?? ""}
                  onChange={(e) => handleFilterChange("precioMax", e.target.value)}
                />
              </div>
            </div>

            {/* Area Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Área (m²)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Mín m²"
                  className="h-9 text-sm"
                  defaultValue={searchParams.get("areaMin") ?? ""}
                  onChange={(e) => handleFilterChange("areaMin", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Máx m²"
                  className="h-9 text-sm"
                  defaultValue={searchParams.get("areaMax") ?? ""}
                  onChange={(e) => handleFilterChange("areaMax", e.target.value)}
                />
              </div>
            </div>

            {/* Dynamic Taxonomy Attributes */}
            {selection.subsegmentId && dynamicAttributes && (
              <DynamicFilterAttributes
                attributes={dynamicAttributes}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
