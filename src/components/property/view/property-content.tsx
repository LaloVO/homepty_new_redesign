"use client";

import { PropertyWithImagesAndAmenities } from "@/types";
import { formatMoney } from "@/utils/formatters";
import {
    ArrowLeftIcon,
    BedIcon,
    BathIcon,
    CalendarIcon,
    DockIcon,
    MapPinIcon,
    MailIcon,
    ScalingIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SquareIcon,
    HomeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PhoneIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppShell } from "@/hooks";
import { MapLocation } from "../map-location";
import { useState } from "react";
import type { PropertyOwner } from "./property-owner-card";

interface Props {
    property: PropertyWithImagesAndAmenities;
    owner: PropertyOwner | null;
}

export function PropertyContent({ property, owner }: Props) {
    const { isRightCollapsed, setIsRightCollapsed } = useAppShell();
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [showEBJson, setShowEBJson] = useState(false);

    const images = property.imagenes_propiedades ?? [];
    const mainImage =
        images.length > 0
            ? images[currentImageIdx]?.image_url
            : "/images/placeholder.svg";

    const operationType =
        property.accionespropiedades?.nombre_accion_propiedad || "Venta";

    // Dirección legible — usa ciudad_nombre/estado_nombre si están disponibles
    const ciudadNombre = (property as unknown as Record<string, string>)["ciudad_nombre"] ?? "";
    const estadoNombre = (property as unknown as Record<string, string>)["estado_nombre"] ?? "";
    const addressLine = [property.direccion, ciudadNombre, estadoNombre]
        .filter(Boolean)
        .join(", ");
    const locationShort = [ciudadNombre, estadoNombre].filter(Boolean).join(", ");

    const prevImage = () =>
        setCurrentImageIdx((i) => (i === 0 ? images.length - 1 : i - 1));
    const nextImage = () =>
        setCurrentImageIdx((i) => (i === images.length - 1 ? 0 : i + 1));

    // Datos EasyBroker raw — serializado como string para evitar 'unknown' en JSX
    const ebDataRaw = (property as unknown as Record<string, unknown>)["easybroker_source_data"];
    const ebDataStr: string | null = ebDataRaw ? JSON.stringify(ebDataRaw, null, 2) : null;

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide h-full bg-white relative">
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/explore"
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <ArrowLeftIcon size={20} />
                    </Link>
                    <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {property.nombre}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                        className={`p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors ${!isRightCollapsed ? "text-primary bg-blue-50" : ""}`}
                        title="Toggle Sidebar"
                    >
                        <DockIcon size={20} className="rotate-90" />
                    </button>
                </div>
            </header>

            {/* ── Galería de fotos ─────────────────────────────────── */}
            <div className="w-full h-[420px] relative bg-slate-900">
                {mainImage && (
                    <Image
                        src={mainImage}
                        alt={property.nombre}
                        fill
                        className="object-cover"
                        priority
                        unoptimized={mainImage.includes("assets.easybroker.com")}
                    />
                )}

                {/* Navegación galería */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                        >
                            <ChevronLeftIcon size={20} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                        >
                            <ChevronRightIcon size={20} />
                        </button>
                        {/* Indicador */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImageIdx(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentImageIdx ? "bg-white scale-125" : "bg-white/50"}`}
                                />
                            ))}
                        </div>
                        {/* Contador */}
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full z-10">
                            {currentImageIdx + 1} / {images.length}
                        </div>
                    </>
                )}

                {/* Miniaturas */}
                {images.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 px-3 pb-10 overflow-x-auto scrollbar-hide z-10">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentImageIdx(i)}
                                className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIdx ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                            >
                                <Image
                                    src={img.image_url}
                                    alt={`Foto ${i + 1}`}
                                    width={56}
                                    height={40}
                                    className="object-cover w-full h-full"
                                    unoptimized={img.image_url.includes("assets.easybroker.com")}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="px-8 py-8 max-w-4xl mx-auto">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase">
                        {property.tipo}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase border border-slate-200">
                        {operationType}
                    </span>
                </div>

                {/* Title & Price */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            {property.nombre}
                        </h2>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <MapPinIcon className="text-primary shrink-0" size={16} />
                            <span>{addressLine || "Dirección no disponible"}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0 ml-6">
                        <div className="text-3xl font-bold text-primary">
                            {formatMoney(property.precio)}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                            MXN / {operationType === "Renta" ? "MES" : ""}
                        </div>
                    </div>
                </div>

                {/* ── Specs — área + área construida ───────────────── */}
                <div className="flex flex-wrap gap-6 py-6 border-y border-slate-100 mb-8">
                    {property.habitaciones > 0 && (
                        <div className="flex items-center gap-3">
                            <BedIcon className="text-slate-400" size={22} />
                            <div className="text-sm font-semibold text-slate-700">
                                {property.habitaciones}{" "}
                                <span className="text-slate-400 font-normal">Habitaciones</span>
                            </div>
                        </div>
                    )}
                    {property.banios > 0 && (
                        <div className="flex items-center gap-3">
                            <BathIcon className="text-slate-400" size={22} />
                            <div className="text-sm font-semibold text-slate-700">
                                {property.banios}{" "}
                                <span className="text-slate-400 font-normal">Baños</span>
                            </div>
                        </div>
                    )}
                    {/* Área total (terreno) */}
                    {property.area > 0 && (
                        <div className="flex items-center gap-3">
                            <SquareIcon className="text-slate-400" size={22} />
                            <div className="text-sm font-semibold text-slate-700">
                                {property.area} m²{" "}
                                <span className="text-slate-400 font-normal">terreno</span>
                            </div>
                        </div>
                    )}
                    {/* Área construida */}
                    {property.area_construida > 0 && (
                        <div className="flex items-center gap-3">
                            <HomeIcon className="text-slate-400" size={22} />
                            <div className="text-sm font-semibold text-slate-700">
                                {property.area_construida} m²{" "}
                                <span className="text-slate-400 font-normal">construidos</span>
                            </div>
                        </div>
                    )}
                    {!!(property.area === 0 && (property.area_construida ?? 0) === 0) && (
                        <div className="flex items-center gap-3">
                            <ScalingIcon className="text-slate-400" size={22} />
                            <div className="text-sm text-slate-400 font-normal">Superficie no especificada</div>
                        </div>
                    )}
                </div>




                {/* Description */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Descripción</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {property.descripcion || "No hay descripción disponible."}
                    </p>
                </div>

                {/* Amenidades */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Amenidades</h3>
                    {property.amenidades_propiedades?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {property.amenidades_propiedades.map((a) => (
                                <span
                                    key={Number(a.id_amenidad)}
                                    className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-200"
                                >
                                    {String(a.id_amenidad)}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 italic text-sm">
                            No hay amenidades registradas para esta propiedad.
                        </p>
                    )}
                </div>

                {/* Location Map */}
                <div className="mb-10">
                    <div className="flex flex-col gap-1 mb-4">
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="text-primary" size={20} />
                            <h3 className="text-lg font-bold text-slate-900">Ubicación</h3>
                        </div>
                        <p className="text-slate-500 text-sm ml-7">
                            {locationShort || property.direccion || "Ubicación no disponible"}
                        </p>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 h-[300px] relative bg-slate-100">
                        <MapLocation />
                    </div>
                </div>

                {/* ── Panel EasyBroker JSON ───────────────────────── */}
                {ebDataStr && (
                    <div className="mb-10 rounded-2xl border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => setShowEBJson((v) => !v)}
                            className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Datos EasyBroker
                                </span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                                    RAW
                                </span>
                            </div>
                            {showEBJson ? (
                                <ChevronUpIcon size={16} className="text-slate-400" />
                            ) : (
                                <ChevronDownIcon size={16} className="text-slate-400" />
                            )}
                        </button>
                        {showEBJson && (
                            <pre className="p-5 text-xs text-slate-600 bg-white overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto">
                                {ebDataStr}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
