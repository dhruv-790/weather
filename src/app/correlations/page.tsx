"use client";

import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export default function CorrelationsPage() {
  const { data, loading } = useAqi();
  const [scatterData, setScatterData] = useState<{ pm25: number; pm10: number; z: number }[]>([]);

  useEffect(() => {
    if (!data) return;
    // Generate mock correlation data only on client
    const mockData = Array.from({ length: 40 }, (_, i) => ({
      pm25: data.iaqi.pm25?.v ? data.iaqi.pm25.v + (Math.random() * 20 - 10) : Math.random() * 50,
      pm10: data.iaqi.pm10?.v ? data.iaqi.pm10.v + (Math.random() * 40 - 20) : Math.random() * 100,
      z: Math.random() * 100
    }));
    setScatterData(mockData);
  }, [data]);

  if (loading || (data && scatterData.length === 0)) return <Skeleton className="h-[500px] w-full" />;
  if (!data) return <div>No data.</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline">Pollutant Correlations</h1>
        <p className="text-muted-foreground">Relationship between PM2.5 and PM10 particles</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Scatter Correlation Matrix</CardTitle>
          <CardDescription>Identifying patterns between fine and coarse particulate matter</CardDescription>
        </CardHeader>
        <CardContent className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis type="number" dataKey="pm25" name="PM2.5" unit="µg" axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="pm10" name="PM10" unit="µg" axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Particulates" data={scatterData} fill="hsl(var(--primary))" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
