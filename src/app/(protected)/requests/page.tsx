import { RequestsEmptyState, RequestsSidebarManager, SectionFilters, TableRequests } from "@/components/requests";
import { ModuleHeader } from "@/components/layout/module-header";
import { getRequests } from "@/server/queries";
import { Suspense } from "react";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QueryResponse, Request } from "@/types";

export default async function RequestsPage(props: {
  searchParams?: Promise<{ status?: string; tipo_propiedad_id?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const status = searchParams?.status || "";
  const tipo_propiedad_id = searchParams?.tipo_propiedad_id || "";
  const search = searchParams?.search || "";

  const requestsPromise = getRequests({ status, tipo_propiedad_id });

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6]/50">
      <RequestsSidebarManager />

      {/* Module Header integrated with the new design */}
      <ModuleHeader title="Solicitudes de Inmuebles" searchPlaceholder="Buscar solicitud, cliente o ID...">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100 shadow-sm">
            AI Sync Active
          </span>
          <Button asChild variant="outline" size="sm" className="h-9 gap-2 ml-2">
            <Link href="/requests/create">
              <PlusIcon size={16} />
              <span className="hidden sm:inline">Crear Solicitud</span>
            </Link>
          </Button>
        </div>
      </ModuleHeader>

      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6 relative">
        {/* Filters Section */}
        <SectionFilters />

        {/* Content Area with Suspense and Fallback */}
        <div className="flex-1 overflow-y-auto min-h-0 rounded-2xl">
          <Suspense
            key={status + tipo_propiedad_id + search}
            fallback={
              <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
                Sincronizando con el motor neural...
              </div>
            }
          >
            <RequestsDataLayer requestsPromise={requestsPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function RequestsDataLayer({ requestsPromise }: { requestsPromise: Promise<QueryResponse<Request[]>> }) {
  const response = await requestsPromise;

  if (!response.ok || !response.data || response.data.length === 0) {
    return <RequestsEmptyState />;
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm overflow-hidden">
      <TableRequests requestsPromise={Promise.resolve(response)} />
    </div>
  );
}
