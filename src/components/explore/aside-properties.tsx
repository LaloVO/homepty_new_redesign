import { PropertyWithImages } from "@/types";
import { PropertyCard } from "./property-card";
import { FilterIcon, Maximize2Icon, SparklesIcon } from "lucide-react";

interface Props {
  properties: PropertyWithImages[];
}
export async function AsideProperties({ properties }: Props) {
  return (
    <aside className="h-full w-full flex flex-col overflow-hidden bg-transparent">
      <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
        <h2 className="text-sm font-bold text-gray-800 tracking-wide flex items-center gap-2">
          Resultados
        </h2>
        <div className="flex gap-1">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
            <FilterIcon size={18} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
            <Maximize2Icon size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <div className="text-[10px] text-gray-400 font-mono mb-2 uppercase tracking-wider pl-1">
          Propiedades Detectadas ({properties.length})
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="text-gray-400 text-sm italic">
              No hay propiedades disponibles en esta vista.
            </span>
          </div>
        ) : (
          properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}

        {/* AI Insights Section */}
        <div className="pt-4 mt-2 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2">
            <SparklesIcon size={18} className="text-purple-600" />
            AI Insights
          </h4>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-indigo-700">Oportunidad:</span> La zona muestra un incremento en demanda.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button className="text-[10px] font-medium text-white bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700 transition-colors">
                Generar Reporte
              </button>
              <button className="text-[10px] font-medium text-indigo-700 bg-white border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50 transition-colors">
                Descartar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 p-4 shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/40 backdrop-blur-sm p-2 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] text-gray-500 uppercase">Avg Yield</div>
            <div className="text-lg font-bold text-gray-900">9.2%</div>
          </div>
          <div className="bg-white/40 backdrop-blur-sm p-2 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] text-gray-500 uppercase">Absorción</div>
            <div className="text-lg font-bold text-emerald-600">Alta</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
