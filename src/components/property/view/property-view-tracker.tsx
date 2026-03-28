"use client";

import { useEffect, useRef } from "react";
import { trackActivity } from "@/server/actions/activity-tracker";

interface PropertyViewTrackerProps {
    propertyId: string | number;
    propertyType: "unit" | "development";
    propertyName?: string;
}

/**
 * Client component that fires a `vista_propiedad` tracking event once per mount.
 * Placed inside Server Component pages to enable activity tracking without
 * converting the entire page to a Client Component.
 *
 * Tracked data feeds into `actividad_usuario` → CRM "Visitas Mensuales" stat.
 */
export function PropertyViewTracker({
    propertyId,
    propertyType,
    propertyName,
}: PropertyViewTrackerProps) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;

        trackActivity({
            tipo_actividad: "vista_propiedad",
            modulo: "properties",
            entidad_id: String(propertyId),
            entidad_tipo: "propiedad",
            metadata: {
                property_type: propertyType,
                property_name: propertyName ?? null,
                url: window.location.href,
            },
        }).catch(() => {
            // Silently fail — never block the user experience
        });
    }, [propertyId, propertyType, propertyName]);

    // Renders nothing — purely a side-effect component
    return null;
}
