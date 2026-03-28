"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Globe, Loader2, AlertCircle, Info } from "lucide-react";

interface CustomDomainManagerProps {
  userId: string;
  currentDomain?: string | null;
  verified?: boolean;
}

export function CustomDomainManager({
  userId,
  currentDomain,
  verified = false,
}: CustomDomainManagerProps) {
  const [domain, setDomain] = useState(currentDomain || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerified, setIsVerified] = useState(verified);

  const handleAddDomain = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CBF_API_URL}/api/cbf/admin/add-custom-domain`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cbf-admin-api-key": process.env.NEXT_PUBLIC_CBF_ADMIN_API_KEY!,
          },
          body: JSON.stringify({
            user_id: userId,
            custom_domain: domain,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add domain");
      }

      setSuccess(
        "¡Dominio agregado exitosamente! Por favor configura tu DNS."
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al agregar el dominio. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDomain = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CBF_API_URL}/api/cbf/admin/verify-domain`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cbf-admin-api-key": process.env.NEXT_PUBLIC_CBF_ADMIN_API_KEY!,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify domain");
      }

      if (data.verified) {
        setSuccess("¡Dominio verificado exitosamente!");
        setIsVerified(true);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setError(
          "El dominio aún no está verificado. Por favor verifica tu configuración DNS."
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al verificar el dominio. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-panel border-slate-200/50 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors duration-700" />

      <CardHeader className="pb-4 border-b border-slate-100/50 bg-slate-50/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Dominio Personalizado</CardTitle>
              <CardDescription className="text-slate-500 font-medium mt-1">
                Configura tu propio dominio para tu sitio web
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Input de dominio */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="tudominio.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={loading || isVerified || !!currentDomain}
            className="flex-1 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-indigo-500/20 text-slate-800 font-medium transition-all"
          />
          {!currentDomain && (
            <Button
              onClick={handleAddDomain}
              disabled={loading || !domain}
              className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Agregar Dominio"
              )}
            </Button>
          )}
          {currentDomain && !isVerified && (
            <Button
              onClick={handleVerifyDomain}
              disabled={loading}
              className="h-11 px-6 rounded-xl bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-all"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Verificar"
              )}
            </Button>
          )}
        </div>

        {/* Estado del dominio */}
        {currentDomain && (
          <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
            {isVerified ? (
              <>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">Dominio activo</p>
                  <p className="text-xs text-green-600/80">Verificado correctamente</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Pendiente de verificación</p>
                  <p className="text-xs text-yellow-600/80">Configura tus DNS para continuar</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mensajes de error/éxito */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 animate-in fade-in slide-in-from-top-2">
            <AlertDescription className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4" />
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800 animate-in fade-in slide-in-from-top-2">
            <AlertDescription className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Instrucciones DNS */}
        {currentDomain && !isVerified && (
          <Alert className="bg-amber-50/50 border-amber-200/50">
            <AlertDescription className="text-slate-700">
              <strong className="text-amber-800 flex items-center gap-2 mb-3">
                <Info className="h-4 w-4" />
                Configuración DNS requerida:
              </strong>

              <div className="space-y-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <strong className="text-sm text-slate-800">Opción A: Nameservers (Recomendado)</strong>
                  <ul className="mt-2 space-y-1.5 list-none">
                    <li className="text-sm text-slate-600 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full"><code className="bg-slate-50 px-1.5 rounded text-indigo-700 font-mono text-xs">ns1.vercel-dns.com</code></li>
                    <li className="text-sm text-slate-600 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full"><code className="bg-slate-50 px-1.5 rounded text-indigo-700 font-mono text-xs">ns2.vercel-dns.com</code></li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <strong className="text-sm text-slate-800">Opción B: Registro CNAME</strong>
                  <ul className="mt-2 space-y-1.5 list-none">
                    <li className="text-sm text-slate-600 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:slate-400 before:rounded-full">Nombre: <span className="font-medium">@</span> (o tu dominio)</li>
                    <li className="text-sm text-slate-600 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:slate-400 before:rounded-full">Valor: <code className="bg-slate-50 px-1.5 rounded text-slate-700 font-mono text-xs">cname.vercel-dns.com</code></li>
                  </ul>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                Los cambios DNS pueden tardar hasta 48 horas en propagarse en internet.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Información adicional */}
        {!currentDomain && (
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm text-slate-800 font-semibold mb-1 block">¿Por qué usar un dominio personalizado?</strong>
              <ul className="space-y-1.5 mt-2">
                <li className="text-sm text-slate-600 flex items-start gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full before:mt-1.5">Refuerza tu marca profesional y credibilidad</li>
                <li className="text-sm text-slate-600 flex items-start gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full before:mt-1.5">Genera mayor confianza en tus clientes</li>
                <li className="text-sm text-slate-600 flex items-start gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full before:mt-1.5">Mejora significativamente tu posicionamiento orgánico (SEO)</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
