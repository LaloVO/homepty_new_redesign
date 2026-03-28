import { PropertyViewLayout } from "@/components/property/view/property-view-layout";
import { PropertyViewTracker } from "@/components/property/view/property-view-tracker";
import { ErrorMessage } from "@/components/shared";
import { getPropertyById } from "@/server/queries";
import { getPropertyOwner, type PropertyOwner } from "@/components/property/view/property-owner-card";

export default async function PropertiesUnitViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await getPropertyById({ id: Number(id) });
  if (!response.ok || !response.data) {
    return <ErrorMessage message={response.message} />;
  }
  const unit = response.data;

  // Fetch property owner in parallel with rendering
  const owner: PropertyOwner | null = unit.id_usuario
    ? await getPropertyOwner(unit.id_usuario)
    : null;

  return (
    <>
      <PropertyViewTracker
        propertyId={id}
        propertyType="unit"
        propertyName={unit.nombre}
      />
      <PropertyViewLayout property={unit} owner={owner} />
    </>
  );
}
