"use client";

import { useAqi } from "@/components/AqiProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WAQI_TOKEN } from "@/lib/waqi";

export default function GeographyPage() {
  const { data, loading } = useAqi();

  if (loading) return <Skeleton className="h-[600px] w-full" />;
  if (!data) return <div>No data.</div>;

  const [lat, lon] = data.city.geo;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-headline">Geographical Context</h1>
        <p className="text-muted-foreground">Nearby monitoring stations and regional air quality</p>
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle>Regional Map</CardTitle>
          <CardDescription>Live sensor network view for {data.city.name}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] w-full bg-muted">
            <iframe 
              src={`https://waqi.info/#/c/${lat}/${lon}/12z?token=${WAQI_TOKEN}`}
              className="w-full h-full border-none"
              title="WAQI Map"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}