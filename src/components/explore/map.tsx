"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: [-99.1332, 19.4326] /** Coordenadas de ciudad de mexico*/,
      zoom: 10.12,
      language: "es-MX",
      style: "mapbox://styles/mapbox/streets-v11",
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    // Agregar el marcador cuando el mapa esté listo
    mapRef.current.on("load", () => {
      mapRef.current?.resize();
      if (mapRef.current) {
        markerRef.current = new mapboxgl.Marker({
          color: "#3B82F6", // Color azul similar a la imagen
        })
          .setLngLat([-99.1332, 19.4326])
          .addTo(mapRef.current);
      }
    });

    // Observar cambios de tamaño del contenedor (sidebar collapse/expand)
    // para que el mapa se redimensione automáticamente
    const container = mapContainerRef.current;
    let resizeObserver: ResizeObserver | undefined;
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        mapRef.current?.resize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver?.disconnect();
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div id="map-container" ref={mapContainerRef} className="relative w-full h-full">
      {/* Mapa se renderiza aquí */}
    </div>
  );
}
