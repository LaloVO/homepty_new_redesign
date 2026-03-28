"use client";

import { useAppShell } from "@/hooks";
import { useEffect } from "react";

interface Props {
    rightPanel: React.ReactNode;
}

export function ExploreLayoutHandler({ rightPanel }: Props) {
    const { setRightPanelContent, setIsRightCollapsed } = useAppShell();

    useEffect(() => {
        // Ensure right panel is expanded
        setIsRightCollapsed(false);

        // Set custom right panel content
        setRightPanelContent(rightPanel);

        // Cleanup: restore defaults when leaving the page
        return () => {
            setRightPanelContent(null);
        };
    }, [setRightPanelContent, rightPanel, setIsRightCollapsed]);

    return null;
}
