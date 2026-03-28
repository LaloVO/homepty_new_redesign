"use client";
import { SidebarTrigger } from "../ui/sidebar";
import { BellIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="px-6 py-4 flex items-center justify-between shrink-0 mb-4">
      {/* Left: Sidebar Trigger (Global Navigation) */}
      <div className="flex items-center">
        <SidebarTrigger className="-ml-3" />
      </div>

      {/* Right: Global Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/properties/create"
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <PlusIcon size={18} />
          <span>Crear Propiedad</span>
        </Link>
        <button
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-colors"
          aria-label="Notificaciones"
        >
          <BellIcon size={20} />
        </button>
      </div>
    </header>
  );
}
