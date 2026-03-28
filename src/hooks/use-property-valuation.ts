"use client";

import { useState, useEffect } from "react";

export interface ValuationResult {
    valor_promedio: number | null;
    valor_promedio_m2: number | null;
    inmuebles: Array<{
        precio: number;
        superficie: number;
        precio_m2: number;
        distancia_km?: number;
        direccion?: string;
    }>;
    error?: string;
}

interface UsePropertyValuationParams {
    direccion: string;
    lat?: number;
    lon?: number;
    tipo_inmueble?: number;
    superficie?: number;
    enabled?: boolean;
}

/**
 * Hook that fetches valuation data from the /api/valueweb/estimate endpoint.
 * Geocodes the address via Mapbox if lat/lon are not provided.
 */
export function usePropertyValuation({
    direccion,
    lat,
    lon,
    tipo_inmueble,
    superficie,
    enabled = true,
}: UsePropertyValuationParams) {
    const [data, setData] = useState<ValuationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !direccion) return;

        let cancelled = false;

        async function fetchValuation() {
            setIsLoading(true);
            setError(null);

            try {
                let finalLat = lat;
                let finalLon = lon;

                // Geocode if no coordinates provided
                if (!finalLat || !finalLon) {
                    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
                    if (!mapboxToken) {
                        throw new Error("Mapbox token no configurado");
                    }

                    const geoRes = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(direccion)}.json?access_token=${mapboxToken}&country=mx&limit=1`
                    );
                    const geoData = await geoRes.json();

                    if (geoData.features?.length > 0) {
                        const [lng, latitude] = geoData.features[0].center;
                        finalLon = lng;
                        finalLat = latitude;
                    } else {
                        throw new Error("No se pudo geocodificar la dirección");
                    }
                }

                const res = await fetch("/api/valueweb/estimate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        lat: finalLat,
                        lon: finalLon,
                        direccion,
                        tipo_inmueble: tipo_inmueble ?? 2,
                        superficie: superficie ?? 100,
                    }),
                });

                const result = await res.json();

                if (!cancelled) {
                    if (result.error && !result.valor_promedio) {
                        setError(result.message || result.error);
                        setData(null);
                    } else {
                        setData(result);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Error al obtener valuación");
                    setData(null);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchValuation();
        return () => { cancelled = true; };
    }, [direccion, lat, lon, tipo_inmueble, superficie, enabled]);

    return { data, isLoading, error };
}
