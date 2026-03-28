"use client";

import { useEffect } from "react";
import { useAppShell } from "@/hooks";
import { ProfitabilityAnalysisPanel } from "./panel-profitability-analysis";


export function HomeLayoutHandler() {
    const { setRightPanelContent, setIsRightCollapsed } = useAppShell();

    useEffect(() => {
        setIsRightCollapsed(false);
        setRightPanelContent(
            <ProfitabilityAnalysisPanel
                onClose={() => setRightPanelContent(null)}
            />
        );

        return () => {
            setRightPanelContent(null);
        };
    }, [setRightPanelContent, setIsRightCollapsed]);

    return null;
}
