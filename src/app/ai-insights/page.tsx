"use client";

import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { getAqiContextualInsights, AqiContextualInsightsOutput } from "@/ai/flows/aqi-contextual-insights";
import { Sparkles, HeartPulse, MessageCircle, ShieldAlert, Zap, AlertTriangle } from "lucide-react";

export default function AiInsightsPage() {
  const { data, loading } = useAqi();
  const [insights, setInsights] = useState<AqiContextualInsightsOutput | null>(null);
  const [fetchingAi, setFetchingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      if (!data) return;
      setFetchingAi(true);
      setError(null);
      try {
        const result = await getAqiContextualInsights({
          aqi: data.aqi,
          location: data.city.name,
          pm25: data.iaqi.pm25?.v,
          pm10: data.iaqi.pm10?.v,
          o3: data.iaqi.o3?.v,
          co: data.iaqi.co?.v,
          so2: data.iaqi.so2?.v,
          no2: data.iaqi.no2?.v,
          dominantPollutant: data.dominentpol,
        });
        setInsights(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch AI insights.';
        setError(message);
      } finally {
        setFetchingAi(false);
      }
    }
    fetchInsights();
  }, [data]);

  if (loading || fetchingAi) {
    return (
      <div className="flex flex-col gap-10 animate-in-fade">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-[350px] rounded-2xl" />
          <Skeleton className="h-[350px] rounded-2xl" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-12 text-center text-muted-foreground italic">No AQI data available.</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-10 animate-in-fade">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-destructive/10 rounded-2xl">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-4xl font-black text-foreground">AI Intelligence</h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">Cognitive analysis of atmospheric safety and health risk.</p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> AI Service Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-4">
              Make sure you have created a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file with a valid <code className="bg-muted px-1 py-0.5 rounded">GOOGLE_GENAI_API_KEY</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!insights) {
    return <div className="p-12 text-center text-muted-foreground italic">AI is processing data for {data.city.name}...</div>;
  }

  return (
    <div className="flex flex-col gap-10 animate-in-fade">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-foreground">AI Intelligence</h1>
        </div>
        <p className="text-muted-foreground text-lg font-medium">Cognitive analysis of atmospheric safety and health risk.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <MessageCircle className="h-40 w-40" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
              Executive Context
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 font-medium italic">Environmental Situation Overview</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 text-xl leading-relaxed font-medium">
            &ldquo;{insights.summary}&rdquo;
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-white dark:bg-card flex flex-col group">
          <CardHeader className="border-b border-muted">
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
              <HeartPulse className="text-accent h-6 w-6" /> Health Protocols
            </CardTitle>
            <CardDescription className="font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Medically informed recommendations</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-4">
            {insights.healthRecommendations.split('. ').filter(Boolean).map((rec, i) => (
              <div key={i} className="flex gap-4 items-start group/item">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0 group-hover/item:scale-150 transition-transform" />
                <p className="text-muted-foreground font-medium leading-relaxed">{rec.trim()}.</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl bg-muted/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
            <ShieldAlert className="text-primary h-5 w-5" /> Safety Intelligence Matrix
          </CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest">Identifying core environmental risk vectors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3 pt-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-card shadow-sm border border-muted flex flex-col gap-2">
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> Status
              </div>
              <span className="text-2xl font-black text-primary">{insights.aqiCategory}</span>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-card shadow-sm border border-muted flex flex-col gap-2">
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Dominant Factor</div>
              <span className="text-2xl font-black text-primary">{data.dominentpol.toUpperCase()}</span>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-card shadow-sm border border-muted flex flex-col gap-2">
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Risk Exposure</div>
              <span className="text-2xl font-black text-primary">{data.aqi > 100 ? 'Elevated Risk' : 'Standard'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

