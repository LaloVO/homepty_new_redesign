import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartLocationOfPropertiesProps {
  locationData: Array<{
    city: string;
    properties: number;
    percentage: number;
  }>;
}

// Color palette for location bars
const BAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

export function ChartLocationOfProperties({ locationData }: ChartLocationOfPropertiesProps) {
  const hasData = locationData.length > 0;
  const maxProperties = Math.max(...locationData.map((l) => l.properties), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Localización de propiedades</CardTitle>
        <CardDescription>Distribución por estado</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Sin datos de localización
          </div>
        ) : (
          <div className="space-y-4">
            {locationData.map((location, index) => (
              <div key={location.city} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{location.city}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{location.properties} propiedades</span>
                    <span className="text-xs">({location.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[index % BAR_COLORS.length]}`}
                    style={{
                      width: `${(location.properties / maxProperties) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
