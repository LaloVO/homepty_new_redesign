"use client";
import { createContext } from "react";

interface AppShellContextType {
    isRightCollapsed: boolean;
    rightPanelContent: React.ReactNode | null;
    setIsRightCollapsed: (v: boolean) => void;
    setRightPanelContent: (v: React.ReactNode | null) => void;
    toggleSidebarRight: () => void;
}

export const AppShellContext = createContext<AppShellContextType | null>(null);
