import { CrmLayoutHandler } from "@/components/crm/crm-layout-handler";
import {
  CardCrm,
  ChartAnnualSalesStatistics,
  ChartTypesOfProperties,
  ChartLocationOfProperties,
  ChartProgressClosedProperties,
} from "@/components/crm";
import { getCrmDashboardStats } from "@/server/queries";
import { Suspense } from "react";
import { Building, Users, Eye, BarChart3 } from "lucide-react";

export default async function CrmPage() {
  const statsPromise = getCrmDashboardStats();

  return (
    <>
      <CrmLayoutHandler />
      <Suspense fallback={<CrmDashboardSkeleton />}>
        <CrmDashboardContent statsPromise={statsPromise} />
      </Suspense>
    </>
  );
}

async function CrmDashboardContent({
  statsPromise,
}: {
  statsPromise: ReturnType<typeof getCrmDashboardStats>;
}) {
  const stats = await statsPromise;

  return (
    <div className="px-6 pt-4 pb-6 flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <CardCrm
          title="Propiedades en venta"
          Icon={Building}
          quantity={stats.propiedadesVenta}
          description="cartera activa"
          progress={stats.totalPropiedades > 0 ? Math.round((stats.propiedadesVenta / stats.totalPropiedades) * 100) : 0}
          variant="blue"
        />
        <CardCrm
          title="Clientes activos"
          Icon={Users}
          quantity={stats.totalClientes}
          description="registrados en CRM"
          tag={stats.totalClientes > 0 ? "activos" : undefined}
          variant="orange"
        />
        <CardCrm
          title="Visitas mensuales"
          Icon={Eye}
          quantity={stats.visitasMensuales}
          description="vista de propiedades"
          variant="green"
        />
        <CardCrm
          title="Total inmuebles"
          Icon={BarChart3}
          quantity={stats.totalPropiedades}
          description={`${stats.propiedadesVenta} venta · ${stats.propiedadesRenta} renta`}
          variant="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartAnnualSalesStatistics chartData={stats.ventasPorMes} />
        </div>
        <div>
          <ChartTypesOfProperties
            chartData={stats.tiposPropiedades}
            totalCount={stats.totalPropiedades}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartLocationOfProperties locationData={stats.localizacion} />
        </div>
        <div>
          <ChartProgressClosedProperties
            completados={stats.cierres.completados}
            total={stats.cierres.total}
            porcentaje={stats.cierres.porcentaje}
          />
        </div>
      </div>
    </div>
  );
}

function CrmDashboardSkeleton() {
  return (
    <div className="px-6 pt-4 pb-6 flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-muted/50 animate-pulse" />
        <div className="h-72 rounded-2xl bg-muted/50 animate-pulse" />
      </div>
    </div>
  );
}