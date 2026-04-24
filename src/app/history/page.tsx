"use client";

import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export default function HistoryPage() {
  const { data, loading } = useAqi();
  const [days, setDays] = useState<{ day: number; val: number }[]>([]);

  useEffect(() => {
    // Generate mock data only on client to avoid hydration mismatch
    const mockDays = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      val: Math.floor(Math.random() * 350) + 10
    }));
    setDays(mockDays);
  }, []);

  if (loading || days.length === 0) return <Skeleton className="h-[500px] w-full" />;
  if (!data) return <div className="p-12 text-center text-muted-foreground italic">No historical data available.</div>;

  // Color logic for US EPA AQI
  const getColor = (val: number) => {
    if (val <= 50) return 'bg-emerald-500';      // Good
    if (val <= 100) return 'bg-yellow-400';      // Moderate
    if (val <= 150) return 'bg-orange-500';      // Unhealthy for Sensitive Groups
    if (val <= 200) return 'bg-red-500';         // Unhealthy
    if (val <= 300) return 'bg-purple-600';      // Very Unhealthy
    return 'bg-red-950';                         // Hazardous
  };

  return (
    <div className="flex flex-col gap-10 animate-in-fade">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-foreground tracking-tighter">Atmospheric Archive</h1>
        <p className="text-muted-foreground font-medium text-lg">Calendar heatmap of {data.city.name}&apos;s historical AQI.</p>
      </div>

      <Card className="border-none shadow-2xl bg-white dark:bg-card/40 backdrop-blur-xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight">30-Day Heatmap</CardTitle>
          <CardDescription className="font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">US EPA standard analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4 py-8">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{d}</div>
            ))}
            {days.map(d => (
              <div 
                key={d.day} 
                className={`aspect-square rounded-2xl flex items-center justify-center text-white text-xs font-black transition-all hover:scale-110 hover:shadow-xl cursor-pointer ${getColor(d.val)} shadow-sm`}
                title={`AQI Score: ${d.val}`}
              >
                {d.day}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 mt-12 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 justify-center">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded-lg"></div> Good</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded-lg"></div> Moderate</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-lg"></div> Sensitive</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-lg"></div> Unhealthy</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-600 rounded-lg"></div> Very Unhealthy</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-950 rounded-lg"></div> Hazardous</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
