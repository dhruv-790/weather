"use client";

import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function ProportionsPage() {
  const { data, loading } = useAqi();

  if (loading) return <Skeleton className="h-[500px] w-full" />;
  if (!data) return <div>No data.</div>;

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    '#1e293b'
  ];

  const pollutantData = [
    { name: 'PM2.5', value: data.iaqi.pm25?.v },
    { name: 'PM10', value: data.iaqi.pm10?.v },
    { name: 'O3', value: data.iaqi.o3?.v },
    { name: 'NO2', value: data.iaqi.no2?.v },
    { name: 'SO2', value: data.iaqi.so2?.v },
    { name: 'CO', value: data.iaqi.co?.v },
  ].filter(p => p.value !== undefined);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline">Pollutant Proportions</h1>
        <p className="text-muted-foreground">Distribution of recorded airborne elements</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Composition Share</CardTitle>
          <CardDescription>Visualizing the dominant contributors to local air quality</CardDescription>
        </CardHeader>
        <CardContent className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pollutantData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={5}
                dataKey="value"
              >
                {pollutantData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}