"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserSiteRow } from "@/types/database-user-sites";
import { ExternalLinkIcon, GlobeIcon, PowerIcon } from "lucide-react";
import { toggleSiteStatusAction } from "@/server/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  userSite: UserSiteRow;
}

export function SiteOverview({ userSite }: Props) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const result = await toggleSiteStatusAction({
        isActive: !userSite.is_active,
      });

      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al cambiar el estado del sitio:", error);
      toast.error("Error inesperado al cambiar el estado");
    } finally {
      setIsToggling(false);
    }
  };

  const siteUrl = userSite.custom_domain
    ? `https://${userSite.custom_domain}`
    : userSite.subdomain
      ? `https://${userSite.subdomain}.homepty.com`
      : null;

  return (
    <Card className="glass-panel border-slate-200/50 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors duration-700" />

      <CardHeader className="pb-4 border-b border-slate-100/50 bg-slate-50/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
              <GlobeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">{userSite.site_name}</CardTitle>
              <CardDescription className="text-slate-500 font-medium mt-1">Vista general de tu sitio web</CardDescription>
            </div>
          </div>
          <Badge
            variant={userSite.is_active ? "default" : "secondary"}
            className={userSite.is_active
              ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"}
          >
            {userSite.is_active ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-6">
          {/* URL Section */}
          <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm font-semibold text-slate-600">URL del Sitio</p>
            {siteUrl ? (
              <div className="flex items-center gap-3">
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-600 font-medium hover:text-blue-700 hover:underline flex items-center gap-1.5 transition-colors"
                >
                  {siteUrl}
                  <ExternalLinkIcon className="h-4 w-4 opacity-70" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No configurado</p>
            )}
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600">Estado de Publicación</p>
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                {userSite.is_active && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${userSite.is_active ? "bg-green-500" : "bg-slate-400"
                  }`}></span>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {userSite.is_active
                  ? "Sitio visible y publicado en internet"
                  : "Sitio pausado (offline)"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
          <Button
            variant={userSite.is_active ? "destructive" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`rounded-full shadow-sm transition-all focus:ring-2 focus:ring-offset-2 ${userSite.is_active
                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300 focus:ring-red-500/20"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 focus:ring-blue-500/20"
              }`}
          >
            <PowerIcon className="h-4 w-4 mr-2" />
            {userSite.is_active ? "Pausar Sitio" : "Publicar Sitio"}
          </Button>

          {siteUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full shadow-sm border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
            >
              <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Visitar Sitio
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
