import { Suspense } from "react";
import {
  PlusIcon,
  Share2Icon,
  Building2Icon,
  OrbitIcon,
  LayoutDashboardIcon,
  RocketIcon
} from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Link from "next/link";
import { TabContentUnits } from "./tab-content-units";
import { TabContentDevelopments } from "./tab-content-developments";
import {
  getAllDevelopmentsByCurrentUser,
  getAllUnitsByCurrentUser,
} from "@/server/queries";
import { cn } from "@/lib/utils";

export function SectionTabs() {
  const unitsPromise = getAllUnitsByCurrentUser();
  const developmentsPromise = getAllDevelopmentsByCurrentUser();

  return (
    <Tabs defaultValue="my-units" className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <TabsList className="bg-transparent h-auto p-0 flex space-x-2 overflow-x-auto pb-0.5 border-b border-gray-100 rounded-none w-full md:w-auto">
          <TabsTrigger
            value="my-units"
            className="px-4 py-2 rounded-t-lg data-[state=active]:bg-white/50 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent transition-all flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-gray-800 bg-transparent shadow-none"
          >
            <Building2Icon className="w-3.5 h-3.5" />
            Mis unidades
          </TabsTrigger>
          <TabsTrigger
            value="my-developments"
            className="px-4 py-2 rounded-t-lg data-[state=active]:bg-white/50 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent transition-all flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-gray-800 bg-transparent shadow-none"
          >
            <OrbitIcon className="w-3.5 h-3.5" />
            Mis desarrollos
          </TabsTrigger>
          <TabsTrigger
            value="my-dashboard"
            className="px-4 py-2 rounded-t-lg data-[state=active]:bg-white/50 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary border-b-2 border-transparent transition-all flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-gray-800 bg-transparent shadow-none"
          >
            <LayoutDashboardIcon className="w-3.5 h-3.5" />
            Mi dashboard
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-x-2 shrink-0">
          <Button
            variant="outline"
            title="Compartir"
            className="bg-white/80 hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 px-3 py-1 rounded-lg text-xs font-medium shadow-sm transition-all flex items-center gap-1.5 h-8"
          >
            <Share2Icon className="w-3.5 h-3.5" /> Compartir
          </Button>
          <Link
            href="/properties/create"
            title="Crear propiedad"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-primary hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-md shadow-primary/10 transition-all flex items-center gap-1.5 h-8 border-none"
            )}
          >
            <PlusIcon className="w-3.5 h-3.5" /> Crear Propiedad
          </Link>
        </div>
      </div>

      <div className="mt-2">
        <TabsContent value="my-units" className="mt-0 outline-none">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12 text-gray-400 text-xs animate-pulse font-medium">
                Cargando unidades...
              </div>
            }
          >
            <TabContentUnits unitsPromise={unitsPromise} />
          </Suspense>
        </TabsContent>
        <TabsContent value="my-developments" className="mt-0 outline-none">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12 text-gray-400 text-xs animate-pulse font-medium">
                Cargando desarrollos...
              </div>
            }
          >
            <TabContentDevelopments developmentsPromise={developmentsPromise} />
          </Suspense>
        </TabsContent>
        <TabsContent value="my-dashboard" className="mt-0 outline-none">
          <div className="glass-card bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 shadow-sm transition-all hover:bg-white/60">
            <h3 className="text-lg font-bold text-gray-800 mb-3 tracking-tight">Próximamente</h3>
            <p className="text-pretty text-gray-500 max-w-[600px] leading-relaxed text-xs">
              <span className="text-primary font-bold">Homepty</span> está aprendiendo de ti. Pronto podrás ver analítica avanzada, actividades clave, recomendaciones personalizadas, planeación estratégica y mucho más.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
              <RocketIcon className="w-4 h-4 animate-bounce" />
              ¡Sigue así!
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
