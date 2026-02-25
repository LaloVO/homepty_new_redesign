"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FilterIcon, PlusIcon } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { TYPES_OF_OPERATIONS, TYPES_OF_PROPERTIES } from "@/utils/constants";
import Link from "next/link";
// Assuming there might be a Sheet or Dialog for "More Filters" or using the existing SectionMoreFilters 
// but for now, the user just asked for the button "Mas Filtros".
// If SectionMoreFilters is needed, we might need to lift state or use a Sheet. 
// Given the previous code, checking if we can reuse SectionMoreFilters logic.
// For now, I'll implement the button as requested.

export function HeaderFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <NativeSelect
                className="w-40 h-9 text-sm"
                value={searchParams.get("type_operation")?.toString() ?? ""}
                onChange={(e) => handleFilterChange("type_operation", e.target.value)}
            >
                <NativeSelectOption value="">Tipo de Operación</NativeSelectOption>
                {TYPES_OF_OPERATIONS.map((op) => (
                    <NativeSelectOption key={op.id} value={op.value}>
                        {op.label}
                    </NativeSelectOption>
                ))}
            </NativeSelect>

            <NativeSelect
                className="w-40 h-9 text-sm"
                value={searchParams.get("type_property")?.toString() ?? ""}
                onChange={(e) => handleFilterChange("type_property", e.target.value)}
            >
                <NativeSelectOption value="">Tipo de Propiedad</NativeSelectOption>
                {TYPES_OF_PROPERTIES.map((type) => (
                    <NativeSelectOption key={type.id} value={type.value}>
                        {type.label}
                    </NativeSelectOption>
                ))}
            </NativeSelect>

            <Button variant="outline" size="sm" className="h-9 gap-2">
                <FilterIcon size={16} />
                <span className="hidden sm:inline">Más Filtros</span>
            </Button>

            <div className="h-6 w-px bg-slate-200 mx-2" />

            <Button asChild variant="default" size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200">
                <Link href="/properties/create">
                    <PlusIcon size={16} />
                    <span className="hidden sm:inline">Crear</span>
                </Link>
            </Button>
        </div>
    );
}
