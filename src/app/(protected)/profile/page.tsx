import {
  SectionTabs,
  UserInfo,
} from "@/components/profile";
import { getUserInfo } from "@/server/queries";
import { ProfileRightPanel } from "@/components/profile/profile-right-panel";
import { ShieldCheckIcon } from "lucide-react";
import { ErrorMessage } from "@/components/shared";

export default async function ProfilePage() {
  // Await directamente — sin Suspense, sin promise, UserInfo siempre estable
  const response = await getUserInfo();
  const user = response.ok && response.data ? response.data : null;

  return (
    <>
      {/* ── Right panel setup (client, no children) ── */}
      <ProfileRightPanel />

      {/* ── Layout: 2 zonas independientes ── */}
      <div className="flex flex-col h-full overflow-hidden">

        {/* ZONA 1: Header + UserInfo — nunca scrollea, siempre visible */}
        <div className="flex flex-col gap-y-3.5 px-6 pt-3 pb-4 shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-gray-800 tracking-tight">
                Vista Profesional
              </h1>
              <div className="h-3 w-px bg-gray-200 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1.5 text-[8px] text-gray-400 bg-white/40 backdrop-blur-sm px-2 py-0.5 rounded border border-gray-100/50 shadow-sm uppercase tracking-wider font-bold">
                <ShieldCheckIcon className="w-2.5 h-2.5 text-blue-500" />
                <span>Google Neural Verified</span>
              </div>
            </div>
          </div>

          {/* UserInfo en zona fija — no afectada por scroll de tabs */}
          {user ? (
            <UserInfo user={user} />
          ) : (
            <ErrorMessage message="No se pudo cargar el perfil del usuario." />
          )}
        </div>

        {/* ZONA 2: SectionTabs — scroll independiente, no arrastra UserInfo */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide min-h-0">
          <SectionTabs />
        </div>

      </div>
    </>
  );
}
