import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartProgressClosedPropertiesProps {
  completados: number;
  total: number;
  porcentaje: number;
}

export function ChartProgressClosedProperties({
  completados,
  total,
  porcentaje,
}: ChartProgressClosedPropertiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso de cierres</CardTitle>
        <CardDescription>Ofertas cerradas del total</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Circular Progress */}
          <div className="relative h-32 w-32">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--chart-1))"
                strokeWidth="3"
                strokeDasharray={`${porcentaje}, 100`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{porcentaje}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              {completados} de {total} ofertas cerradas
            </p>
            {total === 0 && (
              <p className="text-xs text-muted-foreground">
                Sin ofertas registradas aún
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
