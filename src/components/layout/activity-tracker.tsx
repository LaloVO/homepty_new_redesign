"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackActivity } from "@/server/actions";

/**
 * Client-side component that tracks navigation and page views.
 * Mount once in the root layout to capture all route changes.
 * Sends activity data to the server → Supabase → Brain Feature Store.
 */
export function ActivityTracker() {
    const pathname = usePathname();
    const previousPathRef = useRef<string | null>(null);

    useEffect(() => {
        // Skip initial mount if same path (dev hot reload)
        if (previousPathRef.current === pathname) return;
        previousPathRef.current = pathname;

        // Determine module from pathname
        const modulo = getModuleFromPath(pathname);

        // Track navigation
        trackActivity({
            tipo_actividad: "navegacion",
            modulo,
            metadata: { path: pathname },
        }).catch(() => { });

        // Track property views specifically
        const propertyMatch = pathname.match(/^\/property\/(\d+)/);
        if (propertyMatch) {
            trackActivity({
                tipo_actividad: "vista_propiedad",
                modulo: "explore",
                entidad_id: propertyMatch[1],
                entidad_tipo: "propiedad",
            }).catch(() => { });
        }
    }, [pathname]);

    return null; // Headless component
}

function getModuleFromPath(path: string): string {
    if (path.startsWith("/crm")) return "crm";
    if (path.startsWith("/explore")) return "explore";
    if (path.startsWith("/profile")) return "profile";
    if (path.startsWith("/requests")) return "requests";
    if (path.startsWith("/my-site")) return "my-site";
    if (path.startsWith("/property")) return "explore";
    if (path === "/" || path === "/dashboard") return "dashboard";
    return "other";
}
