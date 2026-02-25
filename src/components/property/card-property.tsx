"use client";
import { type PropertyWithImages } from "@/types";
import { BedIcon, BathIcon, ScalingIcon, HeartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  property: PropertyWithImages;
}

export function CardProperty({ property }: Props) {
  // Format price helper
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}k`;
    return `$${price}`;
  };

  // Determine colors based on operation type
  // Use fetched action name or fallback (e.g. from ID logic if needed, but fetch is better)
  const operationType = property.accionespropiedades?.nombre_accion_propiedad || "Venta";
  const isRent = operationType.toLowerCase().includes("renta");

  const badgeColor = isRent ? "bg-blue-600/90" : "bg-emerald-600/90";
  const scoreColor = isRent ? "text-blue-600 border-blue-100 bg-blue-50" : "text-emerald-600 border-emerald-100 bg-emerald-50";

  // Image handling
  const imageUrl = property.imagenes_propiedades?.[0]?.image_url || "https://placehold.co/600x400?text=No+Image";

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-40 w-full overflow-hidden shrink-0">
        <Link href={`/properties/${property.is_unit ? "unit" : "development"}/view/${property.id}`} className="block h-full w-full">
          <Image
            src={imageUrl}
            alt={property.nombre}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Operation Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 ${badgeColor} backdrop-blur-sm text-white text-[10px] font-bold tracking-wide rounded-md shadow-sm uppercase`}>
            {operationType}
          </span>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-2 right-2 z-10">
          <button className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-rose-500 transition-all">
            <HeartIcon size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-base font-bold text-slate-900">
              {formatPrice(property.precio)} <span className="text-xs text-slate-400 font-normal">{isRent ? "/mes" : ""}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 truncate w-40" title={property.nombre}>
              {property.nombre}
            </h3>
          </div>
          {/* AI Score Badge */}
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${scoreColor}`}>
            98%
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <BedIcon size={14} /> {property.habitaciones}
          </span>
          <span className="flex items-center gap-1">
            <BathIcon size={14} /> {property.banios}
          </span>
          <span className="flex items-center gap-1">
            <ScalingIcon size={14} /> {property.area_construida}m²
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="mt-auto pt-3 border-t border-slate-50 grid grid-cols-3 gap-1">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">ROI</div>
            <div className="text-sm font-bold text-blue-600">14%</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Cap</div>
            <div className="text-sm font-bold text-slate-700">6.5%</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Abs.</div>
            <div className="text-sm font-bold text-orange-500">2m</div>
          </div>
        </div>
      </div>
    </article>
  );
}
