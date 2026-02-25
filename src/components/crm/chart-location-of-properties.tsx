import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
const locationData = [
  {
    city: "Madrid",
    properties: 45,
    percentage: 35.2,
    color: "bg-chart-1",
    trend: "+5.2%",
  },
  {
    city: "Barcelona",
    properties: 32,
    percentage: 25.0,
    color: "bg-chart-2",
    trend: "+2.1%",
  },
  {
    city: "Valencia",
    properties: 28,
    percentage: 21.9,
    color: "bg-chart-3",
    trend: "+8.3%",
  },
  {
    city: "Sevilla",
    properties: 15,
    percentage: 11.7,
    color: "bg-chart-4",
    trend: "-1.2%",
  },
  {
    city: "Bilbao",
    properties: 8,
    percentage: 6.2,
    color: "bg-chart-5",
    trend: "+3.4%",
  },
];
export function ChartLocationOfProperties() {
  return (
    <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold text-gray-800">Localización de inmuebles</CardTitle>
        <CardDescription>Distribución geográfica de propiedades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {locationData.map((location) => (
            <div key={location.city} className="group">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{location.city}</span>
                  <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    {location.trend}
                  </span>
                </div>
                <span className="font-mono text-gray-500 font-medium">{location.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${location.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
