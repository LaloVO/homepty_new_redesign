"use client";

import { useEffect } from "react";
import { useAppShell } from "@/hooks";
import { ProfileStats } from "./profile-stats";

export function ProfileClient({ children }: { children: React.ReactNode }) {
    const { setRightPanelContent, setIsRightCollapsed } = useAppShell();

    useEffect(() => {
        // Set the content for the right panel when the profile page is mounted
        setRightPanelContent(<ProfileStats />);

        // Ensure the right panel is open when entering the profile
        setIsRightCollapsed(false);

        // Cleanup: Reset the right panel content when leaving the profile page 
        // (Optional: depending on if we want a default content or just empty)
        return () => {
            setRightPanelContent(null);
        };
    }, [setRightPanelContent, setIsRightCollapsed]);

    return <>{children}</>;
}
