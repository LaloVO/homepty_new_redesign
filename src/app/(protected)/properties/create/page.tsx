import { ButtonBack } from "@/components/shared";
import { BuildingIcon, HouseIcon } from "lucide-react";
import Link from "next/link";

export default async function PropertiesCreatePage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 p-6">
        <div className="flex flex-col gap-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-y-0">
              <h1 className="text-2xl font-semibold">Crear nueva propiedad</h1>
              <p className="text-muted-foreground">
                Selecciona el tipo de propiedad que deseas crear
              </p>
            </div>
            <ButtonBack />
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/properties/unit/create"
              className="flex flex-col gap-y-4 bg-card p-4 rounded border border-slate-100 hover:border-primary transition-colors duration-300"
            >
              <div className="flex items-center justify-center size-12 rounded bg-muted">
                <HouseIcon size={24} className="text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-y-2">
                <h4 className="font-medium">Propiedad individual</h4>
                <span className="text-gray-400">
                  Casa, deparatamento, local, etc.
                </span>
                <p className="text-primary">
                  Ideal para propiedades individuales como casas, departamentos,
                  locales comerciales, terrenos, etc.
                </p>
              </div>
            </Link>
            <Link
              href="/properties/development/create"
              className="flex flex-col gap-y-4 bg-card p-4 rounded border border-slate-100 hover:border-primary transition-colors duration-300"
            >
              <div className="flex items-center justify-center size-12 rounded bg-muted">
                <BuildingIcon size={24} className="text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-y-2">
                <h4 className="font-medium">Desarrollo inmobiliario</h4>
                <span className="text-gray-400">
                  Desarrollos, lotes, edificios, etc.
                </span>
                <p className="text-primary">
                  Ideal para desarrollos inmobiliarios como edificios, lotes,
                  complejos residenciales, etc.
                </p>
              </div>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
