
import { jsPDF } from 'jspdf';
import { WaqiData, getAqiCategory } from './waqi';

export const generateAqiReport = (data: WaqiData) => {
  const doc = new jsPDF();
  const category = getAqiCategory(data.aqi);
  const now = new Date().toLocaleString();

  // Branding Colors
  const primaryColor = [35, 100, 100]; // Approx representation of HSL primary

  // Header
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AeroSense AQI Intelligence Report', 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${now}`, 20, 28);
  doc.setDrawColor(200);
  doc.line(20, 32, 190, 32);

  // City Info
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text(data.city.name, 20, 45);

  // AQI Dashboard Summary
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, 55, 170, 40, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text('Current Air Quality Index (AQI)', 30, 68);
  
  doc.setFontSize(36);
  doc.setTextColor(0);
  doc.text(`${data.aqi}`, 30, 85);
  
  doc.setFontSize(18);
  doc.text(category.label, 80, 85);

  // Detailed Pollutants Section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Pollutant Concentrations', 20, 110);
  
  let y = 120;
  const pollutants = [
    { name: 'PM2.5 (Fine Particulate Matter)', val: data.iaqi.pm25?.v },
    { name: 'PM10 (Coarse Particulate Matter)', val: data.iaqi.pm10?.v },
    { name: 'O3 (Ground-level Ozone)', val: data.iaqi.o3?.v },
    { name: 'NO2 (Nitrogen Dioxide)', val: data.iaqi.no2?.v },
    { name: 'SO2 (Sulfur Dioxide)', val: data.iaqi.so2?.v },
    { name: 'CO (Carbon Monoxide)', val: data.iaqi.co?.v },
  ];

  doc.setFontSize(11);
  pollutants.forEach(p => {
    if (p.val !== undefined) {
      doc.setTextColor(100);
      doc.text(p.name, 30, y);
      doc.setTextColor(0);
      doc.text(`${p.val} µg/m³`, 140, y);
      doc.setDrawColor(240);
      doc.line(30, y + 2, 180, y + 2);
      y += 10;
    }
  });

  // Atmospheric Vitals
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Atmospheric Vitals', 20, y);
  y += 10;

  const atmospheric = [
    { name: 'Temperature', val: data.iaqi.t?.v, unit: '°C' },
    { name: 'Humidity', val: data.iaqi.h?.v, unit: '%' },
    { name: 'Pressure', val: data.iaqi.p?.v, unit: 'hPa' },
    { name: 'Wind Speed', val: data.iaqi.w?.v, unit: 'm/s' },
  ];

  doc.setFontSize(11);
  atmospheric.forEach(a => {
    if (a.val !== undefined) {
      doc.setTextColor(100);
      doc.text(a.name, 30, y);
      doc.setTextColor(0);
      doc.text(`${a.val}${a.unit}`, 140, y);
      doc.setDrawColor(240);
      doc.line(30, y + 2, 180, y + 2);
      y += 10;
    }
  });

  // Disclaimer & Footer
  doc.setFontSize(9);
  doc.setTextColor(150);
  const disclaimer = 'This report is generated using real-time sensor data provided by the World Air Quality Index Project. Air quality can vary significantly over short distances and time periods.';
  doc.text(doc.splitTextToSize(disclaimer, 170), 20, 270);
  
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AeroSense: Global AQI Intelligence Platform', 20, 285);

  doc.save(`AeroSense_AQI_Report_${data.city.name.replace(/\s+/g, '_')}.pdf`);
};
