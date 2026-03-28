import { Suspense } from "react";
import {
  QuickActionCards,
  SectionProperties,
  SectionPropertiesSkeleton,
} from "@/components/home";
import { HeaderFilters } from "@/components/home/header-filters";
import { HomeLayoutHandler } from "@/components/home/home-layout-handler";
import { ModuleHeader } from "@/components/layout/module-header";
import { getAllProperties } from "@/server/queries";

export default async function HomePage(props: {
  searchParams?: Promise<{
    search?: string;
    type_operation?: string;
    type_property?: string;
    precioMin?: string;
    precioMax?: string;
    habitaciones?: string;
    banios?: string;
    estacionamientos?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const filters = {
    search: searchParams?.search || "",
    type_operation: searchParams?.type_operation || "",
    type_property: searchParams?.type_property || "",
    precioMin: searchParams?.precioMin || "",
    precioMax: searchParams?.precioMax || "",
    habitaciones: searchParams?.habitaciones || "",
    banios: searchParams?.banios || "",
    estacionamientos: searchParams?.estacionamientos || "",
    page: searchParams?.page || "1",
  };
  const propertiesPromise = getAllProperties({ filters });
  return (
    <div className="flex flex-col h-full">
      <HomeLayoutHandler />
      {/* Level 3: Module Header */}
      <ModuleHeader title="Marketplace" searchPlaceholder="Buscar propiedades...">
        <HeaderFilters />
      </ModuleHeader>

      {/* Level 4: Content — scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <div className="flex flex-col gap-6 px-6 pb-6 pt-4">
          {/* Quick Action Cards */}
          <QuickActionCards />

          {/* Properties Grid */}
          <Suspense key={filters.search} fallback={<SectionPropertiesSkeleton />}>
            <SectionProperties propertiesPromise={propertiesPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
