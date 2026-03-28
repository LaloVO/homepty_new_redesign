"use client";

import { useEffect } from "react";
import { useAppShell } from "@/hooks";
import { ProfileStats } from "./profile-stats";

/**
 * Mounts the ProfileStats in the AppShell right panel.
 * Renders NO visible children — only configures the right panel.
 * Must be kept as a sibling of the page content, NOT a wrapper.
 */
export function ProfileRightPanel() {
    const { setRightPanelContent, setIsRightCollapsed } = useAppShell();

    useEffect(() => {
        setRightPanelContent(<ProfileStats />);
        setIsRightCollapsed(false);

        return () => {
            setRightPanelContent(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount — stable refs not needed as side-effect is idempotent

    return null; // renders nothing
}
