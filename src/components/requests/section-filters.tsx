"use client";

import { ChangeEvent } from "react";
import { TYPES_OF_PROPERTIES, TYPES_STATUS_REQUEST } from "@/utils/constants";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SparklesIcon } from "lucide-react";

export function SectionFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSelect(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const key = event.target.name;
    const params = new URLSearchParams(searchParams);
    if (value && value !== "todas" && value !== "0") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <section className="flex flex-wrap items-center gap-4 shrink-0">
      {/* Status Filter */}
      <FilterWrapper label="Estado">
        <NativeSelect
          id="status"
          name="status"
          defaultValue={searchParams.get("status")?.toString() ?? "todas"}
          onChange={handleSelect}
          className="border-none bg-transparent shadow-none h-auto p-0 focus-visible:ring-0 font-medium text-slate-700 cursor-pointer pr-6"
        >
          <NativeSelectOption value={"todas"}>Todas</NativeSelectOption>
          {TYPES_STATUS_REQUEST.map((state) => (
            <NativeSelectOption key={state.value} value={state.value}>
              {state.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FilterWrapper>

      {/* Property Type Filter */}
      <FilterWrapper label="Tipo Propiedad">
        <NativeSelect
          id="tipo_propiedad_id"
          name="tipo_propiedad_id"
          defaultValue={searchParams.get("tipo_propiedad_id")?.toString() ?? "0"}
          onChange={handleSelect}
          className="border-none bg-transparent shadow-none h-auto p-0 focus-visible:ring-0 font-medium text-slate-700 cursor-pointer pr-6"
        >
          <NativeSelectOption value={0}>Todas</NativeSelectOption>
          {TYPES_OF_PROPERTIES.map((type) => (
            <NativeSelectOption key={type.value} value={type.id}>
              {type.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FilterWrapper>

      <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

      {/* AI Priority Badge */}
      <div className="bg-blue-50/80 backdrop-blur-md border border-blue-100 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-95">
        <SparklesIcon className="w-4 h-4 text-blue-500 group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-semibold text-blue-600">Alta Prioridad (AI)</span>
      </div>
    </section>
  );
}

function FilterWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm hover:shadow-md transition-all hover:bg-white active:scale-95 group relative">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1">
        {children}
      </div>
    </div>
  );
}
