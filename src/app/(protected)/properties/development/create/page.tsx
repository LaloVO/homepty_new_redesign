import { FormPropertyDevelopment } from "@/components/property/development";
import { ErrorMessage } from "@/components/shared";
import { getAvailableUnitsForDevelopment } from "@/server/queries";

export default async function PropertiesDevelopmentCreatePage() {
  const response = await getAvailableUnitsForDevelopment();
  if (!response.ok || !response.data) {
    return (
      <ErrorMessage message="No se pudieron cargar las unidades disponibles para el desarrollo." />
    );
  }
  const availableUnits = response.data;
  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 p-8">
        <FormPropertyDevelopment availableUnits={availableUnits} />
      </div>
    </div>
  );
}
