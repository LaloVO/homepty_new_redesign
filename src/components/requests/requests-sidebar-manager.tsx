"use client";
import { useEffect } from "react";
import { useAppShell } from "@/hooks";

export function RequestsSidebarManager() {
    const { setIsRightCollapsed } = useAppShell();

    useEffect(() => {
        // Collapse right sidebar when entering requests
        setIsRightCollapsed(true);

        // Optionally restore it when leaving, but usually we just let the next page decide
        // return () => setIsRightCollapsed(false);
    }, [setIsRightCollapsed]);

    return null;
}
