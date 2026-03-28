import { PropertyViewLayout } from "@/components/property/view/property-view-layout";
import { PropertyViewTracker } from "@/components/property/view/property-view-tracker";
import { ErrorMessage } from "@/components/shared";
import { getPropertyById } from "@/server/queries";
import { getPropertyOwner, type PropertyOwner } from "@/components/property/view/property-owner-card";

export default async function PropertiesDevelopmentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await getPropertyById({ id: Number(id) });
  if (!response.ok || !response.data) {
    return <ErrorMessage message={response.message} />;
  }
  const development = response.data;

  // Fetch property owner in parallel with rendering
  const owner: PropertyOwner | null = development.id_usuario
    ? await getPropertyOwner(development.id_usuario)
    : null;

  return (
    <>
      <PropertyViewTracker
        propertyId={id}
        propertyType="development"
        propertyName={development.nombre}
      />
      <PropertyViewLayout property={development} owner={owner} />
    </>
  );
}
