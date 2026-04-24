"use client";

import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAqiCategory, getIndianNaqiCategory, calculateIndianNaqi } from "@/lib/waqi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Globe, Info, Zap, Calculator } from "lucide-react";
import { useState, useEffect } from "react";

export default function ComparisonPage() {
  const { data, loading } = useAqi();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) return (
    <div className="flex flex-col gap-8 animate-in-fade">
      <Skeleton className="h-10 w-64" />
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );

  if (!data) return <div className="p-12 text-center text-muted-foreground italic">No data available for comparison.</div>;

  const usScore = data.aqi;
  const inScore = calculateIndianNaqi(data);

  const usEpa = getAqiCategory(usScore);
  const indianNaqi = getIndianNaqiCategory(inScore);

  // SVG Gauge constants
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  const getOffset = (val: number, max: number) => {
    const progress = Math.min(val / max, 1);
    return circumference - progress * circumference;
  };

  const usEpaBreakpoints = [
    { range: "0 - 50", label: "Good", color: "bg-emerald-500" },
    { range: "51 - 100", label: "Moderate", color: "bg-yellow-400" },
    { range: "101 - 150", label: "Unhealthy for Sensitive Groups", color: "bg-orange-500" },
    { range: "151 - 200", label: "Unhealthy", color: "bg-red-500" },
    { range: "201 - 300", label: "Very Unhealthy", color: "bg-purple-600" },
    { range: "301+", label: "Hazardous", color: "bg-red-950" },
  ];

  const indianNaqiBreakpoints = [
    { range: "0 - 50", label: "Good", color: "bg-emerald-500" },
    { range: "51 - 100", label: "Satisfactory", color: "bg-green-500" },
    { range: "101 - 200", label: "Moderately Polluted", color: "bg-yellow-400" },
    { range: "201 - 300", label: "Poor", color: "bg-orange-500" },
    { range: "301 - 400", label: "Very Poor", color: "bg-red-500" },
    { range: "401 - 500", label: "Severe", color: "bg-red-950" },
  ];

  return (
    <div className="flex flex-col gap-10 animate-in-fade">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">Formula Comparison</h1>
        </div>
        <p className="text-muted-foreground font-medium text-lg">Comparing {data.city.name}&apos;s current atmosphere using US EPA and Indian CPCB formulas.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-2xl bg-white dark:bg-card/40 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <Globe className="h-40 w-40" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
              US EPA Score
            </CardTitle>
            <CardDescription className="font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Standardized AQI Formula</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-4">
            <div className="relative flex items-center justify-center">
              <svg className="h-48 w-48 -rotate-90">
                <circle className="text-muted/10" strokeWidth={stroke} stroke="currentColor" fill="transparent" r={normalizedRadius} cx="96" cy="96" />
                <circle
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset: getOffset(usScore, 500), transition: 'stroke-dashoffset 2s ease' }}
                  strokeLinecap="round"
                  stroke={usEpa.color}
                  fill="transparent"
                  r={normalizedRadius}
                  cx="96"
                  cy="96"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: usEpa.color }}>{usScore}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">EPA AQI</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black tracking-tighter mb-2" style={{ color: usEpa.color }}>{usEpa.label}</div>
              <p className="text-muted-foreground text-xs font-medium max-w-[240px] leading-relaxed">As reported by WAQI using US EPA standards.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-white dark:bg-card/40 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <Calculator className="h-40 w-40" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
              Indian NAQI Score
            </CardTitle>
            <CardDescription className="font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">CPCB Scale via WAQI</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-4">
            <div className="relative flex items-center justify-center">
              <svg className="h-48 w-48 -rotate-90">
                <circle className="text-muted/10" strokeWidth={stroke} stroke="currentColor" fill="transparent" r={normalizedRadius} cx="96" cy="96" />
                <circle
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset: getOffset(inScore, 500), transition: 'stroke-dashoffset 2s ease' }}
                  strokeLinecap="round"
                  stroke={indianNaqi.color}
                  fill="transparent"
                  r={normalizedRadius}
                  cx="96"
                  cy="96"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: indianNaqi.color }}>{inScore}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">NAQI Score</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black tracking-tighter mb-2" style={{ color: indianNaqi.color }}>{indianNaqi.label}</div>
              <p className="text-muted-foreground text-xs font-medium max-w-[240px] leading-relaxed">As reported by WAQI mapped to CPCB categories.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl bg-muted/20 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
            <Info className="h-5 w-5 text-primary" /> Breakpoint Matrix Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t">
            <div className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">US EPA Breakpoints</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Range</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usEpaBreakpoints.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-mono text-xs">{row.range}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${row.color}`} />
                        <span className="font-bold text-xs">{row.label}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">Indian NAQI Breakpoints</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Range</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indianNaqiBreakpoints.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-mono text-xs">{row.range}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${row.color}`} />
                        <span className="font-bold text-xs">{row.label}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
