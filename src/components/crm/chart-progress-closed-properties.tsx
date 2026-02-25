import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function ChartProgressClosedProperties() {
  return (
    <Card className="rounded-2xl border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-gray-800">Progreso de cierres</CardTitle>
        <CardDescription>Porcentaje de inmuebles con cierre exitoso</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700">Cierres completados</span>
            <span className="font-mono text-gray-500 font-bold">20%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-1/5 rounded-full shadow-sm shadow-blue-100" />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">
            Meta mensual: 5 cierres (1/5 completado)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
