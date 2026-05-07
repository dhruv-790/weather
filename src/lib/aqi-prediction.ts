export type AqiPoint = { t: number; aqi: number };
export type PredictedSeriesPoint = { offsetHours: number; predictedAqi: number };

function linearRegression(points: { x: number; y: number }[]) {
  // Least squares: y = a + b*x
  const n = points.length;
  if (n < 2) return { intercept: points[0]?.y ?? 0, slope: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { intercept: sumY / n, slope: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return { intercept, slope };
}

/**
 * Predict next 24 hours AQI values using a simple linear regression model.
 *
 * - The model is trained on provided `history` points.
 * - If history length is small/insufficient, it falls back to a flat forecast.
 */
export function predictNext24hAqiFromHistory(
  history: AqiPoint[]
): {
  predicted24h: number;
  series: PredictedSeriesPoint[];
  model: { intercept: number; slope: number };
} {
  if (!history || history.length === 0) {
    return {
      predicted24h: 0,
      series: Array.from({ length: 25 }, (_, i) => ({ offsetHours: i, predictedAqi: 0 })),
      model: { intercept: 0, slope: 0 },
    };
  }

  const sorted = [...history].sort((a, b) => a.t - b.t);
  const t0 = sorted[0].t;

  // Use hours offsets as x for numeric stability.
  const train = sorted.map((p) => ({ x: (p.t - t0) / 3600000, y: p.aqi }));
  const model = linearRegression(train);

  const series: PredictedSeriesPoint[] = [];
  const startX = train[train.length - 1]?.x ?? 0;

  for (let h = 0; h <= 24; h++) {
    const x = startX + h;
    const y = model.intercept + model.slope * x;
    series.push({ offsetHours: h, predictedAqi: Math.max(0, Math.round(y)) });
  }

  const predicted24h = series[series.length - 1]?.predictedAqi ?? Math.max(0, Math.round(train[train.length - 1]?.y ?? 0));

  return { predicted24h, series, model };
}

/**
 * Build a synthetic AQI history using available pollutants/forecast.
 *
 * This app does not have historical AQI time series from WAQI.
 * So we estimate a short relative trajectory from forecast pollutant averages,
 * then anchor it to the current AQI.
 */
export function estimateAqiHistoryFromForecast(params: {
  nowAqi: number;
  forecast?: {
    daily?: {
      pm25?: { avg: number; day: string; min: number; max: number }[];
      pm10?: { avg: number; day: string; min: number; max: number }[];
      o3?: { avg: number; day: string; min: number; max: number }[];
    };
  };
  // How many history points to create for regression
  historyPoints?: number;
}): AqiPoint[] {
  const { nowAqi, forecast, historyPoints = 7 } = params;
  const daily = forecast?.daily;
  const pm25 = daily?.pm25;
  const pm10 = daily?.pm10;
  const o3 = daily?.o3;

  const available = pm25?.length || pm10?.length || o3?.length ? true : false;

  // If we don't have enough forecast pollutant arrays from WAQI, still return a
  // minimal synthetic history so the dashboard's "Predict next 24h" UI renders.
  // We anchor the forecast to `nowAqi` and keep it flat.
  if (!available) {
    const now = Date.now();
    return [
      { t: now - 3600000, aqi: Math.max(0, Math.round(nowAqi)) },
      { t: now, aqi: Math.max(0, Math.round(nowAqi)) },
    ];
  }


  // Create up to N points from the last available segment of forecast.
  const len = Math.max(pm25?.length ?? 0, pm10?.length ?? 0, o3?.length ?? 0);
  const take = Math.min(historyPoints, len);
  if (take < 2) return [];

  const idxStart = len - take;

  // Compute a simple relative "pollution index" from available pollutant averages.
  // If missing pollutant, ignore that dimension.
  const values: number[] = [];
  const indexes: number[] = [];

  for (let i = idxStart; i < len; i++) {
    const pm25Avg = pm25?.[i]?.avg;
    const pm10Avg = pm10?.[i]?.avg;
    const o3Avg = o3?.[i]?.avg;

    const components: number[] = [];
    if (typeof pm25Avg === 'number') components.push(pm25Avg);
    if (typeof pm10Avg === 'number') components.push(pm10Avg);
    if (typeof o3Avg === 'number') components.push(o3Avg);

    if (components.length === 0) continue;

    // Use mean of available pollutants as a relative driver.
    const mean = components.reduce((a, b) => a + b, 0) / components.length;
    values.push(mean);
    indexes.push(i);
  }

  if (values.length < 2) return [];

  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const denom = maxV - minV;

  const now = Date.now();
  const stepMs = 3600000; // 1h spacing for regression input

  return values.map((v, i) => {
    let rel = 0;
    if (denom === 0) {
      rel = 1;
    } else {
      // Scale 0..1 then map to +-50% around 1.
      rel = (v - minV) / denom; // 0..1
      rel = 0.5 + rel; // 0.5..1.5
    }
    const estimated = Math.max(0, Math.round(nowAqi * rel));
    return { t: now - (values.length - 1 - i) * stepMs, aqi: estimated };
  });
}

