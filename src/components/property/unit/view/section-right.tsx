import { Button } from "@/components/ui/button";
import { Property } from "@/types";
import { DollarSignIcon, HomeIcon } from "lucide-react";
import { CardPriceAnalysis } from "./card-price-analysis";
import { CardCreditSimulator } from "./card-credit-simulator";

interface Props {
  unit: Property;
}
export function SectionRight({ unit }: Props) {
  return (
    <section className="w-full flex flex-col gap-y-4">
      {/* Card de Simulador de crédito hipotecario */}
      <CardCreditSimulator unit={unit} />
      {/* Card de Análisis de precio */}
      <CardPriceAnalysis
        direccion={unit.direccion}
        precio={unit.precio}
        area={unit.area_construida || unit.area}
        tipo_inmueble={2}
      />
      {/* Card de Análisis de inversión */}
      <div className="w-full p-4 rounded border border-muted flex flex-col gap-y-4">
        <div className="flex items-center gap-x-2">
          <DollarSignIcon size={20} className="text-primary" />
          <h4 className="font-medium">Análisis de inversión</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center text-center bg-muted-foreground/5 p-2 rounded">
            <span className="text-sm text-gray-600">ROI estimado</span>
            <span className="font-bold text-lg text-green-600">8.5%</span>
          </div>
          <div className="flex flex-col items-center text-center bg-muted-foreground/5 p-2 rounded">
            <span className="text-sm text-gray-600">Plusvalía anual</span>
            <span className="font-bold text-lg text-blue-600">12%</span>
          </div>
        </div>

        <Button
          className="w-full"
          variant={"outline"}
          title="Solicitar análisis completo"
          disabled
        >
          <HomeIcon size={18} />
          Solicitar análisis completo
        </Button>
      </div>
    </section>
  );
}
