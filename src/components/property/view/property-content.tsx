"use client";

import { PropertyWithImages } from "@/types";
import { formatMoney } from "@/utils/formatters";
import { ArrowLeftIcon, BedIcon, BathIcon, CalendarIcon, DockIcon, MapPinIcon, PhoneIcon, ScalingIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppShell } from "@/components/layout/app-shell";
import { MapLocation } from "../map-location";

interface Props {
    property: PropertyWithImages;
}

export function PropertyContent({ property }: Props) {
    const { isRightCollapsed, setIsRightCollapsed } = useAppShell();

    const mainImage =
        property.imagenes_propiedades.length > 0
            ? property.imagenes_propiedades[0].image_url
            : "/images/placeholder.svg";

    const isRent = property.tipo === "Departamento" || property.precio < 100000; // Mock logic
    const operationType = property.accionespropiedades?.nombre_accion_propiedad || "Venta";

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide h-full bg-white relative">
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/explore" className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors">
                        <ArrowLeftIcon size={20} />
                    </Link>
                    <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {property.nombre}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                        className={`p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors ${!isRightCollapsed ? 'text-primary bg-blue-50' : ''}`}
                        title="Toggle Sidebar"
                    >
                        <DockIcon size={20} className="rotate-90" />
                    </button>
                </div>
            </header>

            {/* Hero Image */}
            <div className="w-full h-[400px] relative">
                <Image
                    src={mainImage}
                    alt={property.nombre}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Content Container */}
            <div className="px-8 py-8 max-w-4xl mx-auto">
                {/* badges */}
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
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{property.nombre}</h2>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <MapPinIcon className="text-primary" size={18} />
                            <span>{property.direccion}, {property.colonia}, {property.codigo_postal}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{formatMoney(property.precio)}</div>
                        <div className="text-xs text-slate-400 font-medium">MXN {isRent ? "/ MES" : ""}</div>
                    </div>
                </div>

                {/* Specs */}
                <div className="flex gap-8 py-6 border-y border-slate-100 mb-8">
                    <div className="flex items-center gap-3">
                        <BedIcon className="text-slate-400" size={24} />
                        <div className="text-sm font-semibold text-slate-700">
                            {property.habitaciones} <span className="text-slate-400 font-normal">Habitaciones</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <BathIcon className="text-slate-400" size={24} />
                        <div className="text-sm font-semibold text-slate-700">
                            {property.banios} <span className="text-slate-400 font-normal">Baños</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ScalingIcon className="text-slate-400" size={24} />
                        <div className="text-sm font-semibold text-slate-700">
                            {property.area_construida} m² <span className="text-slate-400 font-normal">cubiertos</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mb-10">
                    <button className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                        <CalendarIcon size={20} />
                        Agendar visita
                    </button>
                    <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <PhoneIcon size={20} />
                        Llamar ahora
                    </button>
                </div>

                {/* Description */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Descripción</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {property.descripcion || "No hay descripción disponible."}
                    </p>
                </div>

                {/* Amenities (Placeholder for now as logic might need update) */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Amenidades</h3>
                    {/* TODO: Map actual amenities when available in property object */}
                    <p className="text-slate-400 italic text-sm">
                        No hay amenidades registradas para esta propiedad.
                    </p>
                </div>

                {/* Location Map Placeholder */}
                <div className="mb-10">
                    <div className="flex flex-col gap-1 mb-4">
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="text-primary" size={20} />
                            <h3 className="text-lg font-bold text-slate-900">Ubicación</h3>
                        </div>
                        <p className="text-slate-500 text-sm ml-7">
                            {property.direccion}, {property.colonia}
                        </p>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 h-[300px] relative bg-slate-100">
                        <MapLocation />
                    </div>
                </div>

            </div>
        </div>
    );
}
