"use client";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { SparklesIcon, PanelLeftIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function HeaderSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarHeader className={cn(
      "flex items-center h-auto transition-all duration-300",
      isCollapsed ? "flex-col justify-center gap-4 py-4 px-0" : "flex-row px-4 py-4 justify-between"
    )}>
      {isCollapsed ? (
        <div
          className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0 cursor-pointer"
          onClick={toggleSidebar}
        >
          <SparklesIcon size={18} />
        </div>
      ) : (
        <SidebarMenu className="flex-1">
          <SidebarMenuItem className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <SparklesIcon size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">
              Homepty
            </span>
          </SidebarMenuItem>
        </SidebarMenu>
      )}

      <button
        onClick={toggleSidebar}
        className={cn(
          "text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-white transition-all duration-300",
          isCollapsed ? "hover:scale-110" : ""
        )}
      >
        <PanelLeftIcon size={20} className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")} />
      </button>
    </SidebarHeader>
  );
}
