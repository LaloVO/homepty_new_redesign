"use client";
import dynamic from "next/dynamic";
import { SearchIcon, PlusIcon, BellIcon } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { TYPES_OF_PROPERTIES } from "@/utils/constants";
import { Input } from "../ui/input";

const AddressAutoComplete = dynamic(
  () => import("@/components/shared/address-autocomplete"),
  {
    ssr: false,
  }
);

export function SectionFilters() {
  return (
    <header className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm rounded-xl px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center bg-gray-100/50 rounded-full border border-gray-200 px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full max-w-[400px]">
          <SearchIcon size={20} className="text-gray-400" />
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

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 border-r border-gray-200 pr-3 mr-1">
          <NativeSelect className="h-8 text-xs font-medium text-gray-600 bg-white border-gray-200 w-32">
            <NativeSelectOption value={""}>Precio</NativeSelectOption>
          </NativeSelect>

          <NativeSelect className="h-8 text-xs font-medium text-gray-600 bg-white border-gray-200 w-32">
            <NativeSelectOption value={""}>Tipo</NativeSelectOption>
            {TYPES_OF_PROPERTIES.map((type) => (
              <NativeSelectOption key={type.id} value={type.value}>
                {type.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <button className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-indigo-600 rounded-md shadow-sm shadow-indigo-200 transition-all flex items-center gap-1">
            <PlusIcon size={16} /> Nueva
          </button>
        </div>

        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors relative">
          <BellIcon size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}
