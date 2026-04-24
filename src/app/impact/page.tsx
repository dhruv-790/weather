"use client";

import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer 
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function ImpactPage() {
  const { data, loading } = useAqi();

  if (loading) return <Skeleton className="h-[500px] w-full" />;
  if (!data) return <div>No data.</div>;

  // Mock radar data based on current AQI for visualization
  // In a real app, these impacts would be calculated via medical guidelines
  const aqiVal = data.aqi;
  const impactData = [
    { subject: 'Children', A: Math.min(100, aqiVal * 0.8), fullMark: 100 },
    { subject: 'Elderly', A: Math.min(100, aqiVal * 0.9), fullMark: 100 },
    { subject: 'Asthmatics', A: Math.min(100, aqiVal * 1.1), fullMark: 100 },
    { subject: 'Athletes', A: Math.min(100, aqiVal * 0.6), fullMark: 100 },
    { subject: 'Pregnant', A: Math.min(100, aqiVal * 0.85), fullMark: 100 },
    { subject: 'Heart Issues', A: Math.min(100, aqiVal * 0.95), fullMark: 100 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline">Health Sensitivity Impact</h1>
        <p className="text-muted-foreground">Vulnerability levels across demographic groups</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Impact Radar</CardTitle>
          <CardDescription>Relative risk assessment based on current concentrations</CardDescription>
        </CardHeader>
        <CardContent className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={impactData}>
              <PolarGrid stroke="hsl(var(--muted))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
              <Radar
                name="Risk Level"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}