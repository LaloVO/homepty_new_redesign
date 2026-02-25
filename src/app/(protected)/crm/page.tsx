"use client";

import { useEffect } from "react";
import {
  CardCrm,
  ChartAnnualSalesStatistics,
  ChartLocationOfProperties,
  ChartProgressClosedProperties,
  ChartTypesOfProperties,
} from "@/components/crm";
import {
  Building2Icon,
  EyeIcon,
  HouseIcon,
  LayersIcon,
} from "lucide-react";
import { useAppShell } from "@/components/layout/app-shell";
import { CopilotAI } from "@/components/layout/copilot-ai";

export default function CrmPage() {
  const { setRightPanelContent, setIsRightCollapsed } = useAppShell();

  useEffect(() => {
    // Set right panel to Copilot AI and keep it collapsed by default
    setRightPanelContent(<CopilotAI />);
    setIsRightCollapsed(true);

    return () => {
      // Optional: reset right panel content when leaving
      setRightPanelContent(null);
    };
  }, [setRightPanelContent, setIsRightCollapsed]);

  return (
    <div className="flex flex-col gap-16 py-4">
      {/* Stats Cards Grid - More generous gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <CardCrm
          title="Inmuebles en venta"
          Icon={Building2Icon}
          quantity={20}
          description="Total propiedades"
          variant="blue"
          tag="Venta"
          progress={75}
        />
        <CardCrm
          title="Inmuebles en alquiler"
          Icon={HouseIcon}
          quantity={4}
          description="En alquiler"
          variant="green"
          tag="Alquiler"
          progress={25}
        />
        <CardCrm
          title="Visitas mensuales"
          Icon={EyeIcon}
          quantity={128}
          description="Este mes"
          variant="orange"
          tag="Visitas"
          progress={50}
        />
        <CardCrm
          title="Total inmuebles"
          Icon={LayersIcon}
          quantity={24}
          description="Inmuebles"
          variant="purple"
          tag="Total"
          progress={100}
        />
      </div>

      {/* Main Charts Row - Ratios matching image 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-stretch">
        <div className="xl:col-span-8">
          <ChartAnnualSalesStatistics />
        </div>
        <div className="xl:col-span-4 self-stretch">
          <ChartTypesOfProperties />
        </div>
      </div>

      {/* Secondary Info Row - Bottom section for location and progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-12">
        <ChartLocationOfProperties />
        <ChartProgressClosedProperties />
      </div>
    </div>
  );
}
