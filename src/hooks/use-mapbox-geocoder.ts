"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface GeocodingFeature {
    id: string;
    place_name: string;
    center: [number, number]; // [lon, lat]
    text: string;
    context?: Array<{ id: string; text: string }>;
}

interface UseMapboxGeocoderOptions {
    country?: string;
    language?: string;
    types?: string;
    debounceMs?: number;
}

/**
 * Debounced hook that queries the Mapbox Geocoding API.
 * Returns a list of address suggestions and the selected coordinates.
 */
export function useMapboxGeocoder(options: UseMapboxGeocoderOptions = {}) {
    const {
        country = "MX",
        language = "es",
        types = "address,place,neighborhood,locality",
        debounceMs = 350,
    } = options;

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
    const [selected, setSelected] = useState<GeocodingFeature | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const search = useCallback(
        (value: string) => {
            setQuery(value);
            setSelected(null); // reset selection on new input

            if (timerRef.current) clearTimeout(timerRef.current);
            if (!value.trim() || value.length < 3) {
                setSuggestions([]);
                return;
            }

            timerRef.current = setTimeout(async () => {
                abortRef.current?.abort();
                const controller = new AbortController();
                abortRef.current = controller;
                setIsLoading(true);

                try {
                    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
                    const encoded = encodeURIComponent(value);
                    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?country=${country}&language=${language}&types=${types}&autocomplete=true&access_token=${token}`;

                    const res = await fetch(url, { signal: controller.signal });
                    const data = await res.json();
                    setSuggestions(data.features ?? []);
                } catch (err) {
                    if (err instanceof Error && err.name !== "AbortError") {
                        console.error("[Geocoder] Error:", err.message);
                        setSuggestions([]);
                    }
                } finally {
                    setIsLoading(false);
                }
            }, debounceMs);
        },
        [country, language, types, debounceMs]
    );

    const selectFeature = useCallback((feature: GeocodingFeature) => {
        setSelected(feature);
        setQuery(feature.place_name);
        setSuggestions([]);
    }, []);

    const clear = useCallback(() => {
        setQuery("");
        setSelected(null);
        setSuggestions([]);
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            timerRef.current && clearTimeout(timerRef.current);
            abortRef.current?.abort();
        };
    }, []);

    return {
        query,
        suggestions,
        selected,
        isLoading,
        search,
        selectFeature,
        clear,
        /** Shorthand — whether we have confirmed coordinates */
        hasCoordinates: selected !== null,
        /** [lon, lat] → [lat, lon] conversion for valueweb */
        coordinates: selected
            ? { lat: selected.center[1], lon: selected.center[0] }
            : null,
    };
}
