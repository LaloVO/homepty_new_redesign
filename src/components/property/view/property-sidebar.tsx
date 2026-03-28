"use client";

import { Property } from "@/types";
import { usePropertyValuation } from "@/hooks/use-property-valuation";
import { Loader2, MapPinIcon, MailIcon, PhoneIcon, CheckCircle2Icon } from "lucide-react";
import Image from "next/image";
import { STATES_NAMES_BY_ID } from "@/utils/formatters";
import type { PropertyOwner } from "./property-owner-card";

interface Props {
    property: Property;
    owner: PropertyOwner | null;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    }).format(value);
}

export function PropertySidebar({ property, owner }: Props) {
    const { data: valuation, isLoading, error } = usePropertyValuation({
        direccion: property.direccion,
        tipo_inmueble: 2,
        superficie: property.area_construida || property.area,
        enabled: !!property.direccion,
    });

    const precioM2 = property.area_construida > 0
        ? property.precio / property.area_construida
        : null;

    const ownerLocation = owner?.id_estado ? STATES_NAMES_BY_ID[owner.id_estado] : null;

    return (
        <div className="flex flex-col gap-4">
            {/* ── Tarjeta de Propietario / Agente ─────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agente / Propietario</h3>
                </div>
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                <Image
                                    src={owner?.imagen_perfil_usuario ?? "/images/placeholder.svg"}
                                    alt={owner?.nombre_usuario ?? "Agente"}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-100">
                                <CheckCircle2Icon size={12} className="text-blue-500 fill-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {owner?.nombre_usuario ?? "Agente Homepty"}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                                {owner?.actividad_usuario ?? "Agente inmobiliario"}
                            </p>
                            {ownerLocation && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <MapPinIcon size={10} className="text-gray-300 shrink-0" />
                                    <span className="text-[10px] text-gray-400">{ownerLocation}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-1.5 mb-3">
                        {owner?.email_usuario && (
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                <MailIcon size={12} className="text-gray-300 shrink-0" />
                                <a href={`mailto:${owner.email_usuario}`} className="hover:text-primary transition-colors truncate">
                                    {owner.email_usuario}
                                </a>
                            </div>
                        )}
                        {owner?.telefono_usuario && (
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                <PhoneIcon size={12} className="text-gray-300 shrink-0" />
                                <a href={`tel:${owner.telefono_usuario}`} className="hover:text-primary transition-colors">
                                    {owner.telefono_usuario}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-2">
                        {owner?.email_usuario && (
                            <a
                                href={`mailto:${owner.email_usuario}?subject=Consulta sobre propiedad en Homepty`}
                                className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                            >
                                Contactar
                            </a>
                        )}
                        {owner?.telefono_usuario && (
                            <a
                                href={`tel:${owner.telefono_usuario}`}
                                className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors text-center"
                            >
                                Llamar
                            </a>
                        )}
                        {!owner?.email_usuario && !owner?.telefono_usuario && (
                            <span className="text-[11px] text-gray-400 italic">Sin datos de contacto registrados</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Credit Simulation */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Simulación de Crédito</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Precio</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(property.precio)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Enganche (20%)</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(property.precio * 0.2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Financiamiento</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(property.precio * 0.8)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between text-xs">
                        <span className="text-gray-500">Mensualidad est. (20 años)</span>
                        <span className="font-bold text-primary">
                            {formatCurrency((property.precio * 0.8 * 0.01) / (1 - Math.pow(1.01, -240)))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Valuation / Price Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Análisis de Precio</h3>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="ml-2 text-xs text-gray-400">Obteniendo valuación...</span>
                    </div>
                ) : error ? (
                    <div className="space-y-2">
                        {/* Fallback to basic calculation */}
                        {precioM2 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Precio por m²</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(precioM2)}</span>
                            </div>
                        )}
                        <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                            ⚠️ Valuación automática no disponible: {error}
                        </p>
                    </div>
                ) : valuation ? (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Valor estimado</span>
                            <span className="font-bold text-primary">
                                {valuation.valor_promedio ? formatCurrency(valuation.valor_promedio) : "—"}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Precio por m²</span>
                            <span className="font-semibold text-gray-900">
                                {valuation.valor_promedio_m2 ? formatCurrency(valuation.valor_promedio_m2) : precioM2 ? formatCurrency(precioM2) : "—"}
                            </span>
                        </div>
                        {valuation.valor_promedio && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Diferencia</span>
                                {(() => {
                                    const diff = ((property.precio - valuation.valor_promedio) / valuation.valor_promedio) * 100;
                                    const isOverpriced = diff > 0;
                                    return (
                                        <span className={`font-semibold ${isOverpriced ? "text-red-500" : "text-green-500"}`}>
                                            {isOverpriced ? "+" : ""}{diff.toFixed(1)}%
                                        </span>
                                    );
                                })()}
                            </div>
                        )}
                        {valuation.inmuebles && valuation.inmuebles.length > 0 && (
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">
                                    {valuation.inmuebles.length} comparables encontrados
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {precioM2 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Precio por m²</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(precioM2)}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Investment Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Análisis de Inversión</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">ROI estimado</span>
                        <span className="font-semibold text-gray-900">—</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Plusvalía zona</span>
                        <span className="font-semibold text-gray-900">—</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                        Los datos de inversión se calculan con datos de mercado en tiempo real.
                    </p>
                </div>
            </div>
        </div>
    );
}
