import { SectionTabsCrm } from "@/components/crm";
import { CrmLayoutHandler } from "@/components/crm/crm-layout-handler";
import { ModuleHeader } from "@/components/layout/module-header";
import { FilterIcon, ChevronDownIcon, BellIcon } from "lucide-react";
import { Suspense } from "react";

export default function CrmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50/50">
      <CrmLayoutHandler />
      <Suspense fallback={<div className="h-16 w-full bg-white/80 border-b border-slate-200/50" />}>
        <ModuleHeader
          title="CRM Dashboard"
          leftContent={<SectionTabsCrm />}
          hideSearch={true}
          useAiIcon={true}
          rightContent={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all hover:bg-slate-50 cursor-pointer">
                <FilterIcon className="text-slate-400 w-3 h-3" />
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Este Mes</span>
                <ChevronDownIcon className="text-slate-400 w-3 h-3" />
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-all relative">
                <BellIcon size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
              </button>
            </div>
          }
        />
      </Suspense>
      <section className="flex-1 overflow-y-auto p-12 lg:p-16 scrollbar-hide">
        <div className="max-w-[1600px] mx-auto pb-10">
          {children}
        </div>
      </section>
    </div>
  );
}
