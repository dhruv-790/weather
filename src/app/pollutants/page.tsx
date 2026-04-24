"use client";

import React, { useMemo } from "react";
import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function PollutantsPage() {
  const { data, loading } = useAqi();

  const pollutantData = useMemo(() => {
    if (!data) return [];
    
    return [
      { name: 'PM2.5', value: data.iaqi.pm25?.v, color: 'hsl(var(--chart-1))' },
      { name: 'PM10', value: data.iaqi.pm10?.v, color: 'hsl(var(--chart-2))' },
      { name: 'O3', value: data.iaqi.o3?.v, color: 'hsl(var(--chart-3))' },
      { name: 'NO2', value: data.iaqi.no2?.v, color: 'hsl(var(--chart-4))' },
      { name: 'SO2', value: data.iaqi.so2?.v, color: 'hsl(var(--chart-5))' },
      { name: 'CO', value: data.iaqi.co?.v, color: 'hsl(190 73% 30%)' },
    ].filter(p => p.value !== undefined);
  }, [data]);

  if (loading) return <Skeleton className="h-[500px] w-full" />;
  if (!data) return <div>No data.</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline">Pollutant Breakdown</h1>
        <p className="text-muted-foreground">Specific chemical and particulate concentrations</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
          <CardDescription>Concentration levels in µg/m³ or ppb</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pollutantData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {pollutantData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}