import { createClient } from "@/lib/supabase/server";
import { MapPinIcon, MailIcon, PhoneIcon, CheckCircle2Icon } from "lucide-react";
import Image from "next/image";
import { STATES_NAMES_BY_ID } from "@/utils/formatters";

interface Props {
    userId: string;
    onContactar?: () => void;
}

export interface PropertyOwner {
    id: string;
    nombre_usuario: string | null;
    email_usuario: string | null;
    telefono_usuario: string | null;
    imagen_perfil_usuario: string | null;
    id_estado: number | null;
    actividad_usuario: string | null;
}

export async function getPropertyOwner(userId: string): Promise<PropertyOwner | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre_usuario, email_usuario, telefono_usuario, imagen_perfil_usuario, id_estado, actividad_usuario")
        .eq("id", userId)
        .single();

    if (error || !data) return null;
    return data as PropertyOwner;
}

interface CardProps {
    userId: string;
}

export async function PropertyOwnerCard({ userId }: CardProps) {
    const owner = await getPropertyOwner(userId);

    const location = owner?.id_estado ? STATES_NAMES_BY_ID[owner.id_estado] : null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header label */}
            <div className="px-4 pt-4 pb-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agente / Propietario</h3>
            </div>

            {/* Owner info */}
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
                        {location && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <MapPinIcon size={10} className="text-gray-300 shrink-0" />
                                <span className="text-[10px] text-gray-400">{location}</span>
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

                {/* Contactar CTA */}
                <ContactButtons owner={owner} />
            </div>
        </div>
    );
}

// Client button component (kept inline for simplicity)
function ContactButtons({ owner }: { owner: PropertyOwner | null }) {
    if (!owner) return null;
    return (
        <div className="flex gap-2">
            {owner.email_usuario && (
                <a
                    href={`mailto:${owner.email_usuario}?subject=Consulta sobre propiedad en Homepty`}
                    className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                    Contactar
                </a>
            )}
            {owner.telefono_usuario && (
                <a
                    href={`tel:${owner.telefono_usuario}`}
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                    Llamar
                </a>
            )}
            {!owner.email_usuario && !owner.telefono_usuario && (
                <span className="text-[11px] text-gray-400 italic">Sin datos de contacto</span>
            )}
        </div>
    );
}
