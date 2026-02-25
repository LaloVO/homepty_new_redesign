import { PropertyViewLayout } from "@/components/property/view/property-view-layout";
import { ErrorMessage } from "@/components/shared";
import { getPropertyById } from "@/server/queries";
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

  const mainImage =
    unit.imagenes_propiedades.length > 0
      ? unit.imagenes_propiedades[0].image_url
      : "/images/placeholder.svg";
  return (
    <PropertyViewLayout property={unit} />
  );
}
