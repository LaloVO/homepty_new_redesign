"use client";
import { PropertyWithImagesAndAmenities } from "@/types";
import { useEffect } from "react";
import { PropertyContent } from "./property-content";
import { PropertySidebar } from "./property-sidebar";
import { useAppShell } from "@/hooks";
import type { PropertyOwner } from "./property-owner-card";

interface Props {
    property: PropertyWithImagesAndAmenities;
    owner: PropertyOwner | null;
}

export function PropertyViewLayout({ property, owner }: Props) {
    const { setRightPanelContent, setIsRightCollapsed } = useAppShell();

    // Inject Sidebar content on mount
    useEffect(() => {
        setRightPanelContent(<PropertySidebar property={property} owner={owner} />);
        setIsRightCollapsed(false);

        return () => {
            setRightPanelContent(null);
        };
    }, [property, owner, setRightPanelContent, setIsRightCollapsed]);

    return <PropertyContent property={property} owner={owner} />;
}
