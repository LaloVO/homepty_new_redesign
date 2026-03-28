import { PropertyWithImages } from "@/types";
import { formatMoney } from "@/utils/formatters";
import Image from "next/image";
import Link from "next/link";

interface Props {
  property: PropertyWithImages;
}

export function PropertyCard({ property }: Props) {
  const imageUrl =
    property.imagenes_propiedades.length > 0
      ? property.imagenes_propiedades[0].image_url
      : "/images/placeholder.svg";

  // Mock ROI/CAP/VAL logic for demonstration (matching HTML fragment's look)
  const isRent = property.nombre.toLowerCase().includes("torre") || property.precio! < 100000;
  const badgeLabel = isRent ? "99%" : "94%";

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-float hover:border-primary/30 transition-all cursor-pointer group">
      <Link
        href={`/properties/${property.is_unit ? "unit" : "development"}/view/${property.id}`}
        className="flex gap-3"
      >
        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={property.nombre}
            fill
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1 left-1 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-600 shadow-sm">
            {badgeLabel}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="text-sm font-bold text-gray-800 truncate">{property.nombre}</h3>
          </div>
          <p className="text-[11px] text-gray-500 truncate mb-2">
            {property.area} m² - {property.habitaciones || 0} Hab
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">
              {formatMoney(property.precio || 0)}
              {isRent && <span className="text-[10px] text-gray-400 font-normal">/mo</span>}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              ROI 14%
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
