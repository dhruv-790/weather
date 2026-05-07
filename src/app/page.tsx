"use client";

import React, { useMemo } from "react";
import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAqiCategory, calculateUSEPAAqi } from "@/lib/waqi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Clock, Thermometer, Droplets, Wind, Gauge, Activity, Download, SearchX, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAqiReport } from "@/lib/pdf-generator";
import {
  estimateAqiHistoryFromForecast,
  predictNext24hAqiFromHistory,
} from "@/lib/aqi-prediction";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";



export default function Dashboard() {
  const { data, loading, refresh, notFound, city } = useAqi();

  const usEpaAqi = useMemo(() => data ? calculateUSEPAAqi(data) : null, [data]);
  const usCategory = useMemo(() => usEpaAqi ? getAqiCategory(usEpaAqi) : null, [usEpaAqi]);

  // SVG Gauge constants
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const getOffset = (val: number, max: number) => {
    const progress = Math.min(val / max, 1);
    return circumference - progress * circumference;
  };

  const prediction = useMemo(() => {
    if (!data || usEpaAqi == null) return null;

    const history = estimateAqiHistoryFromForecast({
      nowAqi: usEpaAqi,
      forecast: data.forecast,
      historyPoints: 7,
    });

    if (history.length < 2) return null;

    return predictNext24hAqiFromHistory(history);
  }, [data, usEpaAqi]);

  const forecastCategory = useMemo(() => {
    if (!prediction) return null;
    return getAqiCategory(prediction.predicted24h);
  }, [prediction]);

  if (loading) {
    return (
      <div className="flex flex-col gap-12 animate-in-fade">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-border/50">
          <div className="flex flex-col gap-3 flex-1">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </header>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <SearchX className="h-16 w-16 text-muted-foreground/50" />
        <div className="text-center">
          <h2 className="text-2xl font-black mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-6">Unable to fetch air quality data for "{city}"</p>
          <Button onClick={refresh} className="rounded-2xl">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 animate-in-fade">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-border/50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter" suppressHydrationWarning>{data.city.name}</h1>
            <div className="h-4 w-4 rounded-full bg-accent shadow-[0_0_8px_rgba(var(--accent),0.4)]" />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              Real-Time Feed
            </div>
            <p className="text-sm font-medium" suppressHydrationWarning>Updated: {data.time.s}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => data && generateAqiReport(data)} 
            className="rounded-2xl h-12 px-6 border-2 font-bold hover:bg-accent hover:border-accent hover:text-white transition-colors duration-200 hidden md:flex"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF Report
          </Button>
          <Button 
            variant="secondary" 
            onClick={refresh} 
            disabled={loading}
            className="rounded-2xl h-12 px-6 font-bold bg-primary text-white hover:scale-105 transition-transform duration-200 group shadow-md shadow-primary/20"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* AQI Forecast (Next 24h) */}
        <Card className="border-none shadow-md bg-white dark:bg-card/40 p-6 lg:col-span-2">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" /> AQI Forecast (Next 24h)
            </CardTitle>
            <CardDescription className="text-muted-foreground">Linear regression projection anchored to forecast trends</CardDescription>
          </CardHeader>

          <div className="grid gap-6 md:grid-cols-[200px_1fr] items-center">
            <div className="flex flex-col gap-2">
              <div className="text-4xl font-black tracking-tighter" style={{ color: forecastCategory?.color || 'inherit' }}>
                {prediction?.predicted24h ?? '--'}
              </div>
              <div className="text-sm font-black" style={{ color: forecastCategory?.color || 'inherit' }}>
                {forecastCategory?.label ?? ''}
              </div>
              <div className="text-xs text-muted-foreground">
                Predicted peak AQI at end of 24h window
              </div>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prediction?.series ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="offsetHours"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 24]}
                    type="number"
                    ticks={[0, 6, 12, 18, 24]}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`${value} AQI`, 'AQI']}
                    labelFormatter={(label: any) => `T+${label}h`}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedAqi"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* US EPA Card */}

        <Card className="flex flex-col items-center justify-center p-8 border-none shadow-md bg-white dark:bg-card/40 relative">
          <CardHeader className="text-center p-0 mb-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">US AQI (EPA Scale - WAQI)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 p-0">
            <div className="relative flex items-center justify-center">
              <svg className="h-48 w-48 -rotate-90">
                <circle className="text-muted/10" strokeWidth={stroke} stroke="currentColor" fill="transparent" r={normalizedRadius} cx="96" cy="96" />
                <circle
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset: getOffset(usEpaAqi || 0, 500), transition: 'stroke-dashoffset 0.6s ease-out' }}
                  strokeLinecap="round"
                  stroke={usCategory?.color || 'inherit'}
                  fill="transparent"
                  r={normalizedRadius}
                  cx="96"
                  cy="96"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black tracking-tighter leading-none mb-1" style={{ color: usCategory?.color || 'inherit' }}>{usEpaAqi}</span>
                <span className="text-[8px] font-black text-muted-foreground/40 tracking-[0.2em] uppercase">AQI (US EPA)</span>
              </div>
            </div>
            <div className="text-center px-4">
              <div className="text-lg font-black mb-1" style={{ color: usCategory?.color || 'inherit' }}>{usCategory?.label || ''}</div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">As reported by WAQI</p>
            </div>
          </CardContent>
        </Card>

        {/* Atmospheric Vitals Card */}
        <Card className="shadow-md border-none bg-gradient-to-br from-primary to-primary/90 text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Wind className="h-48 w-48" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Activity className="h-6 w-6 text-accent" /> Sensor Stream
            </CardTitle>
            <CardDescription className="text-primary-foreground/60 font-bold uppercase tracking-widest text-[8px] pt-1">Multisensor environmental data</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pt-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: 'Humidity', value: data.iaqi.h?.v, unit: '%', icon: Droplets },
                { label: 'Pressure', value: data.iaqi.p?.v, unit: 'hPa', icon: Gauge },
                { label: 'Temp', value: data.iaqi.t?.v, unit: '°C', icon: Thermometer },
                { label: 'Wind', value: data.iaqi.w?.v, unit: 'm/s', icon: Wind },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary-foreground/40 text-[8px] font-black uppercase tracking-[0.2em]">
                    <item.icon className="h-3 w-3 text-accent" />
                    {item.label}
                  </div>
                  <div className="text-2xl font-black tracking-tighter">
                    {item.value ?? '--'}
                    <span className="text-xs font-medium opacity-30 ml-1">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {[
          { key: 'pm25', name: 'PM2.5', label: 'Fine Particles' },
          { key: 'pm10', name: 'PM10', label: 'Coarse Particles' },
          { key: 'o3', name: 'Ozone', label: 'Ground O3' }
        ].map((pollutant) => {
          const val = data.iaqi[pollutant.key as keyof typeof data.iaqi]?.v;
          return (
            <Card key={pollutant.key} className="border-none shadow-sm bg-white dark:bg-card/40 overflow-hidden p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
                    {pollutant.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-tight opacity-40">{pollutant.label}</span>
                </div>
                <div className="p-2 bg-primary/5 rounded-xl">
                  <Zap className="h-4 w-4 text-primary/30" />
                </div>
              </div>
              <CardContent className="p-0">
                <div className="text-4xl font-black tracking-tighter flex items-baseline gap-2 mb-4">
                  {val ?? 'N/A'} 
                  <span className="text-[10px] font-black text-muted-foreground/30 tracking-[0.15em] uppercase">µg/m³</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${Math.min((val ?? 0) / 2, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Disclaimer Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-900/50">
        <div className="flex gap-4">
          <div className="flex-shrink-0 pt-1">
            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 text-sm">
            <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">Important Disclaimer</h3>
            <p className="text-amber-800 dark:text-amber-300 mb-2">
              This AQI is based on <strong>near real-time sensor data</strong> and may differ from official <strong>EPA</strong> AQI which uses 24-hour or 8-hour averages.
            </p>
            <p className="text-amber-800 dark:text-amber-300 mb-2">
              <strong>Source:</strong> WAQI (World Air Quality Index Project)
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              For official air quality standards and health guidance, please refer to: <a href="https://www.epa.gov/air-quality" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">EPA (USA)</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

