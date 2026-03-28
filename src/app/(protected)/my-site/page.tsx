import { Suspense } from "react";
import { getUserSite } from "@/server/queries";
import { MySiteContent, MySiteSkeleton } from "@/components/my-site";
import { ModuleHeader } from "@/components/layout/module-header";

export default async function MySitePage() {
    const userSitePromise = getUserSite();

    return (
        <div className="flex flex-col h-full">
            <Suspense fallback={<div className="h-16 border-b border-slate-200/50 bg-white/80" />}>
                <ModuleHeader title="Mi Sitio Web" hideSearch />
            </Suspense>

            <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6 relative">
                <div className="flex-1 overflow-y-auto min-h-0 rounded-2xl">
                    <Suspense fallback={<MySiteSkeleton />}>
                        <MySiteContent userSitePromise={userSitePromise} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
