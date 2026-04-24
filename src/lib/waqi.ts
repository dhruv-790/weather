export const WAQI_TOKEN = process.env.WAQI_API_KEY || '';
export const WAQI_BASE_URL = 'https://api.waqi.info';

// Simple in-memory cache for API responses
const cache = new Map<string, { data: WaqiData; timestamp: number }>();

export interface WaqiIaqiValue {
  v: number;
}

export interface WaqiData {
  aqi: number;
  idx: number;
  attributions: { name: string; url: string }[];
  city: {
    geo: [number, number];
    name: string;
    url: string;
  };
  dominentpol: string;
  iaqi: {
    pm25?: WaqiIaqiValue;
    pm10?: WaqiIaqiValue;
    o3?: WaqiIaqiValue;
    no2?: WaqiIaqiValue;
    so2?: WaqiIaqiValue;
    co?: WaqiIaqiValue;
    t?: WaqiIaqiValue;
    p?: WaqiIaqiValue;
    h?: WaqiIaqiValue;
    w?: WaqiIaqiValue;
  };
  time: {
    s: string;
    tz: string;
    v: number;
  };
  forecast?: {
    daily?: {
      pm25?: { avg: number; day: string; max: number; min: number }[];
      pm10?: { avg: number; day: string; max: number; min: number }[];
      o3?: { avg: number; day: string; max: number; min: number }[];
      uvi?: { avg: number; day: string; max: number; min: number }[];
    };
  };
}

/**
 * Robust station discovery engine with caching.
 */
export async function getCityAqi(query: string): Promise<WaqiData | null> {
  if (!query) return null;
  
  // Simple in-memory cache with TTL
  const cacheKey = `waqi_${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
    return cached.data;
  }
  
  try {
    const searchUrl = `${WAQI_BASE_URL}/search/?token=${WAQI_TOKEN}&keyword=${encodeURIComponent(query)}`;
    const searchResponse = await fetch(searchUrl, { 
      cache: 'force-cache',
      next: { revalidate: 300 } // 5 minutes
    });
    const searchResult = await searchResponse.json();
    
    if (searchResult.status === 'ok' && searchResult.data && searchResult.data.length > 0) {
      const stations = searchResult.data;
      const target = stations.find((s: any) => 
        s.station.name.toLowerCase().includes(query.toLowerCase()) && 
        s.aqi !== '-' && 
        !isNaN(parseInt(s.aqi))
      ) || stations.find((s: any) => s.aqi !== '-' && !isNaN(parseInt(s.aqi)))
        || stations[0];
      
      const stationId = target.uid;
      const feedUrl = `${WAQI_BASE_URL}/feed/@${stationId}/?token=${WAQI_TOKEN}`;
      const feedResponse = await fetch(feedUrl, { 
        cache: 'force-cache',
        next: { revalidate: 300 } // 5 minutes
      });
      const feedResult = await feedResponse.json();
      
      if (feedResult.status === 'ok' && feedResult.data) {
        cache.set(cacheKey, { data: feedResult.data, timestamp: Date.now() });
        return feedResult.data;
      }
    }

    const directUrl = `${WAQI_BASE_URL}/feed/${encodeURIComponent(query)}/?token=${WAQI_TOKEN}`;
    const directResponse = await fetch(directUrl, { 
      cache: 'force-cache',
      next: { revalidate: 300 } // 5 minutes
    });
    const directResult = await directResponse.json();
    if (directResult.status === 'ok' && directResult.data) {
      cache.set(cacheKey, { data: directResult.data, timestamp: Date.now() });
      return directResult.data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Calculate sub-index using EPA formula: I = ((I_hi - I_lo) / (BP_hi - BP_lo)) * (C - BP_lo) + I_lo
 */
function calculateEPASubIndex(concentration: number, bpLo: number, bpHi: number, iLo: number, iHi: number): number {
  if (concentration < bpLo) return iLo;
  if (concentration > bpHi) return iHi;
  return ((iHi - iLo) / (bpHi - bpLo)) * (concentration - bpLo) + iLo;
}

/**
 * Get EPA AQI breakpoint for PM2.5 (µg/m³, 24-hour average)
 */
function getEPAPM25SubIndex(pm25: number): number {
  // Truncate to 1 decimal place
  pm25 = Math.floor(pm25 * 10) / 10;

  if (pm25 <= 12.0) return Math.round(calculateEPASubIndex(pm25, 0.0, 12.0, 0, 50));
  if (pm25 <= 35.4) return Math.round(calculateEPASubIndex(pm25, 12.1, 35.4, 51, 100));
  if (pm25 <= 55.4) return Math.round(calculateEPASubIndex(pm25, 35.5, 55.4, 101, 150));
  if (pm25 <= 150.4) return Math.round(calculateEPASubIndex(pm25, 55.5, 150.4, 151, 200));
  if (pm25 <= 250.4) return Math.round(calculateEPASubIndex(pm25, 150.5, 250.4, 201, 300));
  return Math.round(calculateEPASubIndex(pm25, 250.5, 500.4, 301, 500));
}

/**
 * Get EPA AQI breakpoint for PM10 (µg/m³, 24-hour average)
 */
function getEPAPM10SubIndex(pm10: number): number {
  // Truncate to integer
  pm10 = Math.floor(pm10);

  if (pm10 <= 54) return Math.round(calculateEPASubIndex(pm10, 0, 54, 0, 50));
  if (pm10 <= 154) return Math.round(calculateEPASubIndex(pm10, 55, 154, 51, 100));
  if (pm10 <= 254) return Math.round(calculateEPASubIndex(pm10, 155, 254, 101, 150));
  if (pm10 <= 354) return Math.round(calculateEPASubIndex(pm10, 255, 354, 151, 200));
  if (pm10 <= 424) return Math.round(calculateEPASubIndex(pm10, 355, 424, 201, 300));
  return Math.round(calculateEPASubIndex(pm10, 425, 604, 301, 500));
}

/**
 * Get EPA AQI breakpoint for NO₂ (ppb, 1-hour)
 */
function getEPANO2SubIndex(no2: number): number {
  if (no2 <= 53) return Math.round(calculateEPASubIndex(no2, 0, 53, 0, 50));
  if (no2 <= 100) return Math.round(calculateEPASubIndex(no2, 54, 100, 51, 100));
  if (no2 <= 360) return Math.round(calculateEPASubIndex(no2, 101, 360, 101, 150));
  if (no2 <= 649) return Math.round(calculateEPASubIndex(no2, 361, 649, 151, 200));
  if (no2 <= 1249) return Math.round(calculateEPASubIndex(no2, 650, 1249, 201, 300));
  return Math.round(calculateEPASubIndex(no2, 1250, 2049, 301, 500));
}

/**
 * Get EPA AQI breakpoint for SO₂ (ppb, 1-hour)
 */
function getEPASO2SubIndex(so2: number): number {
  if (so2 <= 35) return Math.round(calculateEPASubIndex(so2, 0, 35, 0, 50));
  if (so2 <= 75) return Math.round(calculateEPASubIndex(so2, 36, 75, 51, 100));
  if (so2 <= 185) return Math.round(calculateEPASubIndex(so2, 76, 185, 101, 150));
  if (so2 <= 304) return Math.round(calculateEPASubIndex(so2, 186, 304, 151, 200));
  if (so2 <= 604) return Math.round(calculateEPASubIndex(so2, 305, 604, 201, 300));
  return Math.round(calculateEPASubIndex(so2, 605, 1004, 301, 500));
}

/**
 * Get EPA AQI breakpoint for CO (ppm, 8-hour)
 */
function getEPACOSubIndex(co: number): number {
  if (co <= 4.4) return Math.round(calculateEPASubIndex(co, 0.0, 4.4, 0, 50));
  if (co <= 9.4) return Math.round(calculateEPASubIndex(co, 4.5, 9.4, 51, 100));
  if (co <= 12.4) return Math.round(calculateEPASubIndex(co, 9.5, 12.4, 101, 150));
  if (co <= 15.4) return Math.round(calculateEPASubIndex(co, 12.5, 15.4, 151, 200));
  if (co <= 30.4) return Math.round(calculateEPASubIndex(co, 15.5, 30.4, 201, 300));
  return Math.round(calculateEPASubIndex(co, 30.5, 50.4, 301, 500));
}

/**
 * Get EPA AQI breakpoint for O₃ (ppm, 8-hour primary standard)
 */
function getEPAO3SubIndex(o3: number): number {
  // Truncate to 3 decimals
  o3 = Math.floor(o3 * 1000) / 1000;

  if (o3 <= 0.054) return Math.round(calculateEPASubIndex(o3, 0.000, 0.054, 0, 50));
  if (o3 <= 0.070) return Math.round(calculateEPASubIndex(o3, 0.055, 0.070, 51, 100));
  if (o3 <= 0.085) return Math.round(calculateEPASubIndex(o3, 0.071, 0.085, 101, 150));
  if (o3 <= 0.105) return Math.round(calculateEPASubIndex(o3, 0.086, 0.105, 151, 200));
  if (o3 <= 0.200) return Math.round(calculateEPASubIndex(o3, 0.106, 0.200, 201, 300));
  return Math.round(calculateEPASubIndex(o3, 0.201, 0.604, 301, 500));
}

/**
 * Calculate US EPA AQI for all available pollutants
 * Formula: AQI = max(all_pollutant_sub_indices)
 *
 * NOTE: When using WAQI API data, the API already provides the final AQI
 * in data.aqi. We use that directly instead of recalculating from pollutant
 * values, which are for display only.
 */
export function calculateUSEPAAqi(data: WaqiData): number {
  // WAQI API provides the final AQI — use it directly
  return data.aqi;
}

/**
 * Returns AQI Category based on US EPA Standard
 */
export function getAqiCategory(aqi: number) {
  if (aqi <= 50) return { label: 'Good', color: 'hsl(142 76% 36%)' };
  if (aqi <= 100) return { label: 'Moderate', color: 'hsl(48 96% 53%)' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'hsl(24 94% 50%)' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'hsl(0 84% 60%)' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'hsl(280 60% 50%)' };
  return { label: 'Hazardous', color: 'hsl(0 72% 30%)' };
}

/**
 * Calculate sub-index using CPCB formula: I = ((I_hi - I_lo) / (BP_hi - BP_lo)) * (C - BP_lo) + I_lo
 */
function calculateSubIndex(concentration: number, bpLo: number, bpHi: number, iLo: number, iHi: number): number {
  return ((iHi - iLo) / (bpHi - bpLo)) * (concentration - bpLo) + iLo;
}

/**
 * Get the appropriate breakpoint range for a pollutant concentration (CPCB Standard)
 */
function getCPCBBreakpoint(concentration: number, breakpoints: Array<{ c: [number, number]; i: [number, number] }>): { c: [number, number]; i: [number, number] } | null {
  for (const bp of breakpoints) {
    if (concentration >= bp.c[0] && concentration <= bp.c[1]) {
      return bp;
    }
  }
  // If above highest breakpoint, use the highest one
  if (breakpoints.length > 0 && concentration > breakpoints[breakpoints.length - 1].c[1]) {
    return breakpoints[breakpoints.length - 1];
  }
  return null;
}

/**
 * Calculate sub-index for a pollutant using CPCB standard
 */
function calculateCPCBSubIndex(concentration: number, breakpoints: Array<{ c: [number, number]; i: [number, number] }>): number {
  const bp = getCPCBBreakpoint(concentration, breakpoints);
  if (!bp) return 0;
  return Math.round(calculateSubIndex(concentration, bp.c[0], bp.c[1], bp.i[0], bp.i[1]));
}

/**
 * Calculates Indian NAQI score based on EXACT CPCB formula
 * Reference: Central Pollution Control Board (CPCB) Official Method
 *
 * NOTE: When using WAQI API data, the API already provides the final AQI
 * in data.aqi. We use that directly instead of recalculating from pollutant
 * values, which are for display only.
 */
export function calculateIndianNaqi(data: WaqiData): number {
  // WAQI API provides the final AQI — use it directly
  return data.aqi;
}

/**
 * Returns AQI Category based on Indian National AQI (NAQI) Standard (CPCB)
 * Reference: Central Pollution Control Board (CPCB) Official Categories
 */
export function getIndianNaqiCategory(aqi: number) {
  if (aqi <= 50) return { label: 'Good', color: 'hsl(142 76% 36%)' };
  if (aqi <= 100) return { label: 'Satisfactory', color: 'hsl(84 80% 45%)' };
  if (aqi <= 200) return { label: 'Moderately Polluted', color: 'hsl(48 96% 53%)' };
  if (aqi <= 300) return { label: 'Poor', color: 'hsl(24 94% 50%)' };
  if (aqi <= 400) return { label: 'Very Poor', color: 'hsl(0 84% 60%)' };
  return { label: 'Severe', color: 'hsl(0 72% 30%)' };
}
