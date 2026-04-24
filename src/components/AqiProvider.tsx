"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WaqiData, getCityAqi } from '@/lib/waqi';

interface AqiContextType {
  data: WaqiData | null;
  loading: boolean;
  city: string;
  setCity: (city: string) => void;
  refresh: () => void;
  notFound: boolean;
}

const AqiContext = createContext<AqiContextType | undefined>(undefined);

export function AqiProvider({ children }: { children: React.ReactNode }) {
  const [city, setCity] = useState('New Delhi');
  const [data, setData] = useState<WaqiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    const result = await getCityAqi(city);
    if (result) {
      setData(result);
    } else {
      setData(null);
      setNotFound(true);
    }
    setLoading(false);
  }, [city]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetCity = useCallback((newCity: string) => {
    if (newCity !== city) {
      setCity(newCity);
    }
  }, [city]);

  return (
    <AqiContext.Provider value={{
      data,
      loading,
      city,
      setCity: handleSetCity,
      refresh: fetchData,
      notFound
    }}>
      {children}
    </AqiContext.Provider>
  );
}

export function useAqi(): AqiContextType {
  const context = useContext(AqiContext);
  if (context === undefined) {
    throw new Error('useAqi must be used within an AqiProvider');
  }
  return context;
}

