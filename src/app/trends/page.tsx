"use client";

import React, { useMemo } from "react";
import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendsPage() {
  const { data, loading } = useAqi();

  const chartData = useMemo(() => {
    if (!data?.forecast?.daily?.pm25) return [];
    
    return data.forecast.daily.pm25.map(item => ({
      date: new Date(item.day).toLocaleDateString(undefined, { weekday: 'short' }),
      avg: item.avg,
      max: item.max,
      min: item.min
    }));
  }, [data]);

  if (loading) return <Skeleton className="h-[500px] w-full" />;
  if (!data?.forecast?.daily?.pm25) return <div>No forecast data available for this city.</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline">Historical & Future Trends</h1>
        <p className="text-muted-foreground">PM2.5 Forecast Trend (7 Days)</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>PM2.5 Outlook</CardTitle>
          <CardDescription>Visualizing projected average and range of particulate matter</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="avg" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorAvg)" 
                strokeWidth={3}
              />
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="hsl(var(--chart-5))" 
                strokeDasharray="5 5" 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="min" 
                stroke="hsl(var(--chart-2))" 
                strokeDasharray="5 5" 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}