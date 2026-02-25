"use client";

import {
    SearchIcon,
    PanelRightCloseIcon,
    PanelRightOpenIcon,
    SparklesIcon
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useAppShell } from "./app-shell";
import { cn } from "@/lib/utils";

interface ModuleHeaderProps {
    title: string;
    children?: React.ReactNode;
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    searchPlaceholder?: string;
    searchParamName?: string;
    useAiIcon?: boolean;
    hideSearch?: boolean;
}

import { useSidebar, SidebarTrigger } from "../ui/sidebar";

export function ModuleHeader({
    title,
    children,
    leftContent,
    rightContent,
    searchPlaceholder = "Buscar...",
    searchParamName = "search",
    useAiIcon = false,
    hideSearch = false
}: ModuleHeaderProps) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();
    const { isRightCollapsed, setIsRightCollapsed } = useAppShell();
    const { state } = useSidebar();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set(searchParamName, term);
        } else {
            params.delete(searchParamName);
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <header className="sticky top-0 z-40 px-6 py-4 glass-panel flex items-center justify-between gap-4 shrink-0 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-6 shrink-0">
                <div className="flex items-center gap-3">
                    {state === "collapsed" && (
                        <SidebarTrigger className="text-slate-500 hover:text-slate-800 transition-colors" />
                    )}
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-800 whitespace-nowrap">
                        {title}
                    </h1>
                </div>
                {leftContent && (
                    <div className="ml-2">
                        {leftContent}
                    </div>
                )}
            </div>

            {!hideSearch && (
                <div className="flex-1 max-w-md flex items-center bg-slate-50 border border-slate-200 rounded-full px-2 py-1 transition-all focus-within:bg-white focus-within:shadow-md focus-within:border-blue-300/30 group">
                    <div className="pl-3 pr-2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <SearchIcon size={18} />
                    </div>
                    <input
                        className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 placeholder:text-slate-400 text-sm font-medium h-8"
                        placeholder={searchPlaceholder}
                        type="text"
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get(searchParamName)?.toString()}
                    />
                </div>
            )}

            <div className="flex items-center gap-4 shrink-0">
                {rightContent}
                {children}
                <button
                    className={cn(
                        "p-2.5 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 group relative",
                        !isRightCollapsed
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-200/50"
                            : "bg-slate-50 text-slate-400 border border-slate-200 hover:border-blue-200 hover:text-blue-600 hover:bg-white"
                    )}
                    onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                    title={useAiIcon ? "Toggle AI Copilot" : "Toggle Sidebar"}
                >
                    {useAiIcon ? (
                        <SparklesIcon size={20} className={cn(
                            "transition-transform duration-500",
                            !isRightCollapsed ? "rotate-12 scale-110" : ""
                        )} />
                    ) : (
                        isRightCollapsed ? <PanelRightOpenIcon size={20} /> : <PanelRightCloseIcon size={20} />
                    )}
                    {!isRightCollapsed && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
