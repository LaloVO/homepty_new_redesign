"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  ventas: {
    label: "Ventas",
    color: "hsl(var(--chart-1))",
  },
  alquileres: {
    label: "Alquileres",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface ChartAnnualSalesStatisticsProps {
  chartData: Array<{
    month: string;
    ventas: number;
    alquileres: number;
  }>;
}

export function ChartAnnualSalesStatistics({ chartData }: ChartAnnualSalesStatisticsProps) {
  const hasData = chartData.some((d) => d.ventas > 0 || d.alquileres > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas de ventas</CardTitle>
        <CardDescription>Propiedades listadas en los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            No hay datos suficientes para mostrar el gráfico
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="alquileres"
                type="natural"
                fill="var(--color-alquileres)"
                fillOpacity={0.4}
                stroke="var(--color-alquileres)"
                stackId="a"
              />
              <Area
                dataKey="ventas"
                type="natural"
                fill="var(--color-ventas)"
                fillOpacity={0.4}
                stroke="var(--color-ventas)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
