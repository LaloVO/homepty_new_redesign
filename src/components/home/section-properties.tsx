import { PropertyWithImages, QueryResponse } from "@/types";
import { ErrorMessage } from "../shared";
import { CardProperty } from "../property";

interface Props {
  propertiesPromise: Promise<QueryResponse<PropertyWithImages[]>>;
}
export async function SectionProperties({ propertiesPromise }: Props) {
  const propertiesResponse = await propertiesPromise;
  if (!propertiesResponse.ok || !propertiesResponse.data) {
    return <ErrorMessage message="Error al cargar las propiedades" />;
  }
  const properties = propertiesResponse.data;
  if (properties.length === 0) {
    return (
      <span className="text-center w-full text-gray-500 text-sm">No se encontraron propiedades.</span>
    );
  }
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {properties.map((property) => (
        <CardProperty key={property.id} property={property} />
      ))}
    </section>
  );
}
