"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  BarChart3,
  LineChart,
  Map as MapIcon,
  Activity,
  PieChart as PieIcon,
  Calendar,
  ScatterChart,
  Scale,
  Search,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";
import { useAqi } from "@/components/AqiProvider";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pollutants", url: "/pollutants", icon: BarChart3 },
  { title: "Trends", url: "/trends", icon: LineChart },
  { title: "Geography", url: "/geography", icon: MapIcon },
  { title: "Impact", url: "/impact", icon: Activity },
  { title: "Proportions", url: "/proportions", icon: PieIcon },
  { title: "History", url: "/history", icon: Calendar },
  { title: "Correlations", url: "/correlations", icon: ScatterChart },
  { title: "Comparison", url: "/comparison", icon: Scale },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { city, setCity } = useAqi();
  const [searchValue, setSearchValue] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSearchValue(city);
  }, [city]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() && searchValue.trim() !== city) {
      setCity(searchValue.trim());
    }
  }, [searchValue, city, setCity]);

  if (!mounted) {
    return null;
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-6 pb-2">
        <div className="flex items-center gap-3 px-2 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Wind className="h-6 w-6" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-black text-xl tracking-tighter">
              AeroSense
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Global AQI Intelligence
            </span>
          </div>
        </div>
        <form onSubmit={handleSearch} className="px-2 group-data-[collapsible=icon]:hidden">
          <div className="relative group">
            <SidebarInput
              placeholder="Search city or station..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-11 bg-muted/50 border-none rounded-2xl focus-visible:ring-primary/30 transition-all"
            />
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
        </form>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel 
            className="group-data-[collapsible=icon]:hidden px-4 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 mb-2"
          >
            Analytics Engine
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="px-4 py-6 rounded-xl transition-all hover:bg-muted active:scale-95">
                      <item.icon className="h-5 w-5" />
                      <span className="font-semibold tracking-tight">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

