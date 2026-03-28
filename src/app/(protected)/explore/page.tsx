import { AsideProperties, Map, SectionFilters, ExploreLayoutHandler } from "@/components/explore";
import { ErrorMessage } from "@/components/shared";
import { getAllPropertiesByCurrentUser } from "@/server/queries";

export default async function ExplorePage() {
  const response = await getAllPropertiesByCurrentUser();
  if (!response.ok || !response.data) {
    return <ErrorMessage message="Error al cargar las propiedades." />;
  }
  const properties = response.data;

  return (
    <>
      <ExploreLayoutHandler
        rightPanel={<AsideProperties properties={properties} />}
      />
      <div className="flex flex-col h-full w-full relative">
        <div className="flex-1 relative">
          <Map />
          <div className="absolute top-4 left-4 right-4 z-10">
            <SectionFilters />
          </div>
        </div>
      </div>
    </>
  );
}
