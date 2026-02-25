import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  CameraIcon,
  Share2Icon,
  CheckCircle2Icon,
} from "lucide-react";
import { DialogEditUser } from "./dialog-edit-user";
import { ErrorMessage } from "../shared";
import { STATES_NAMES_BY_ID } from "@/utils/formatters";
import { QueryResponse, User } from "@/types";
import { Button } from "../ui/button";
import Image from "next/image";

interface Props {
  userPromise: Promise<QueryResponse<User>>;
}

export async function UserInfo({ userPromise }: Props) {
  const response = await userPromise;
  if (!response.ok || !response.data) {
    return <ErrorMessage message="Error al obtener el usuario." />;
  }
  const user = response.data;

  return (
    <div className="glass-card rounded-2xl overflow-hidden relative group mb-6 border border-gray-200/50 shadow-sm bg-white/40 backdrop-blur-md transition-all duration-300">
      {/* Banner / Cover */}
      <div className="h-36 w-full bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <Button
          variant="secondary"
          className="absolute top-3 right-3 bg-white/70 hover:bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-medium text-gray-600 flex items-center gap-1.5 transition-all shadow-sm border-none h-7"
        >
          <CameraIcon size={12} />
          Cambiar Portada
        </Button>
      </div>

      <div className="px-6 pb-6 relative">
        <div className="flex justify-between items-end -mt-10 mb-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-white p-1 shadow-md shadow-gray-200/40 border border-gray-100">
              <Image
                alt={user.nombre_usuario ?? "Profile"}
                className="w-full h-full object-cover rounded-lg"
                src={user.imagen_perfil_usuario ?? "/images/placeholder.svg"}
                width={80}
                height={80}
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-100 flex items-center justify-center">
              <CheckCircle2Icon className="text-blue-500 fill-white" size={16} />
            </div>
          </div>
          <div className="flex gap-2 mb-1">
            <Button
              variant="outline"
              className="bg-white/80 hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-800 px-3 py-1 rounded-lg text-[11px] font-medium shadow-sm transition-all flex items-center gap-1.5 h-8"
            >
              <Share2Icon size={14} />
              Compartir
            </Button>
            <DialogEditUser user={user} />
          </div>
        </div>

        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {user.nombre_usuario ?? "Sin nombre"}
              </h2>
              <span className="px-1.5 py-0.5 rounded bg-blue-50/80 text-blue-600 text-[9px] font-bold border border-blue-100 uppercase tracking-tighter">
                Top Agent
              </span>
            </div>
            {user.actividad_usuario && (
              <p className="text-gray-400 mt-0.5 text-xs font-medium">
                {user.actividad_usuario}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                <MapPinIcon size={13} className="text-gray-300" />
                {user.id_estado ? STATES_NAMES_BY_ID[user.id_estado] : "Sin ubicación"}
              </span>
              <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                <MailIcon size={13} className="text-gray-300" />
                {user.email_usuario}
              </span>
              {user.telefono_usuario && (
                <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                  <PhoneIcon size={13} className="text-gray-300" />
                  {user.telefono_usuario}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { label: "Activas", value: "24" },
              { label: "Ventas", value: "142" },
              { label: "Rating", value: "4.9" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center px-3 py-1.5 bg-white/50 rounded-xl border border-gray-100 shadow-sm min-w-[60px] backdrop-blur-sm">
                <div className="text-sm font-bold text-gray-800 leading-tight">{stat.value}</div>
                <div className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold whitespace-nowrap">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {user.descripcion_usuario && (
          <div className="mt-4 pt-4 border-t border-gray-100/60">
            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl italic font-medium">
              &quot;{user.descripcion_usuario}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
