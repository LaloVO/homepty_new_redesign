import { QueryResponse } from "@/types";
import { UserSiteRow } from "@/types/database-user-sites";
import { SiteOverview } from "./site-overview";
import { CustomDomainManager } from "./custom-domain-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Info } from "lucide-react";

interface Props {
  userSitePromise: Promise<QueryResponse<UserSiteRow>>;
}

export async function MySiteContent({ userSitePromise }: Props) {
  const response = await userSitePromise;

  // Si el usuario NO tiene un sitio creado por el CBF
  if (!response.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 animate-in fade-in duration-700 relative">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-3xl w-full space-y-10">
          <div className="text-center space-y-5">
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 shadow-xl shadow-blue-500/10 mb-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 rounded-3xl" />
              <Globe className="w-12 h-12 text-blue-600 drop-shadow-md" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-800">
              Aún no tienes un sitio web
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Tu sitio web personalizado te permitirá mostrar tus propiedades a tus clientes con tu propia marca, diseño y dominio.
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200/50 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800 ml-2">
              <strong className="font-semibold">¿Cómo obtener tu sitio?</strong>
              <br />
              Contacta al equipo de Homepty para activar tu sitio web personalizado.
              Una vez activado, podrás gestionarlo desde aquí.
            </AlertDescription>
          </Alert>

          <Card className="glass-panel border-slate-200/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            <CardHeader className="pb-4 border-b border-slate-100/50 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-800">Beneficios de tu sitio web</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100/80 flex items-center justify-center mb-1">
                  <div className="w-4 h-4 rounded-full bg-blue-600 shadow-sm shadow-blue-600/50" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Marca Propia</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Tu sitio reflejará tu identidad profesional con tu logo, colores y dominio.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100/80 flex items-center justify-center mb-1">
                  <div className="w-4 h-4 rounded-full bg-indigo-600 shadow-sm shadow-indigo-600/50" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Sincronización Aut.</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Las propiedades agregadas aquí se mostrarán automáticamente en tu sitio.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-purple-100/80 flex items-center justify-center mb-1">
                  <div className="w-4 h-4 rounded-full bg-purple-600 shadow-sm shadow-purple-600/50" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Inteligencia</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Tu sitio estará conectado a Homepty Brain para análisis y recomendaciones.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userSite = response.data;

  // Si el usuario SÍ tiene sitio - Mostrar vista de gestión
  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Vista general del sitio */}
        <SiteOverview userSite={userSite} />

        {/* Gestión de dominio personalizado */}
        <CustomDomainManager
          userId={userSite.user_id_supabase}
          currentDomain={userSite.custom_domain}
          verified={userSite.domain_verified}
        />
      </div>

      {/* Información adicional */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm max-w-3xl">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800 ml-2 text-sm leading-relaxed">
          <strong className="font-semibold">Próximamente:</strong> Podrás personalizar el tema, configurar el SEO, conectar herramientas de analítica y ver las métricas de tu sitio directamente desde este panel de control.
        </AlertDescription>
      </Alert>
    </div>
  );
}
