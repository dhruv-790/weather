'use server';
/**
 * @fileOverview Provides natural language summaries and health recommendations based on US EPA AQI levels.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AqiContextualInsightsInputSchema = z.object({
  aqi: z.number().describe('The overall Air Quality Index (AQI) value.'),
  location: z.string().describe('The city or location for which the AQI data is relevant.'),
  pm25: z.number().optional().describe('Concentration of PM2.5 in µg/m³.'),
  pm10: z.number().optional().describe('Concentration of PM10 in µg/m³.'),
  o3: z.number().optional().describe('Concentration of O3 in µg/m³.'),
  co: z.number().optional().describe('Concentration of CO in ppm.'),
  so2: z.number().optional().describe('Concentration of SO2 in ppb.'),
  no2: z.number().optional().describe('Concentration of NO2 in ppb.'),
  dominantPollutant: z.string().optional().describe('The dominant pollutant contributing to the current AQI.'),
});
export type AqiContextualInsightsInput = z.infer<typeof AqiContextualInsightsInputSchema>;

const AqiContextualInsightsOutputSchema = z.object({
  summary: z.string().describe('A natural language summary of the current AQI situation.'),
  healthRecommendations: z.string().describe('Actionable health recommendations based on the US EPA AQI scale.'),
  aqiCategory: z.string().describe('The category of the AQI (Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous).'),
});
export type AqiContextualInsightsOutput = z.infer<typeof AqiContextualInsightsOutputSchema>;

export async function getAqiContextualInsights(input: AqiContextualInsightsInput): Promise<AqiContextualInsightsOutput> {
  return aqiContextualInsightsFlow(input);
}

const aqiContextualInsightsPrompt = ai.definePrompt({
  name: 'aqiContextualInsightsPrompt',
  input: { schema: AqiContextualInsightsInputSchema },
  output: { schema: AqiContextualInsightsOutputSchema },
  prompt: `You are an environmental health expert. Your task is to provide a natural language summary and health recommendations based on the US EPA Air Quality Index (AQI) standard.

US EPA AQI Scale:
- Good: 0-50
- Moderate: 51-100
- Unhealthy for Sensitive Groups: 101-150
- Unhealthy: 151-200
- Very Unhealthy: 201-300
- Hazardous: 301+

Generate a concise summary for {{{location}}} with AQI {{{aqi}}}.

Provide tailored health protocols. 
- For 'Good', state that air quality is satisfactory and poses little risk.
- For 'Moderate', mention that air quality is acceptable but may be a concern for a small number of people who are unusually sensitive to air pollution.
- For 'Unhealthy for Sensitive Groups', advise members of sensitive groups to reduce prolonged or heavy outdoor exertion.
- For 'Unhealthy', advise everyone to reduce prolonged or heavy outdoor exertion. Members of sensitive groups should avoid outdoor exertion.
- For 'Very Unhealthy', issue a health alert: everyone may experience more serious health effects. Everyone should avoid prolonged or heavy outdoor exertion.
- For 'Hazardous', issue a health warning of emergency conditions: everyone is more likely to be affected. Everyone should avoid all outdoor physical activity.

Input Context:
AQI: {{{aqi}}}
Location: {{{location}}}
Dominant Pollutant: {{{dominantPollutant}}}`,
});

const aqiContextualInsightsFlow = ai.defineFlow(
  {
    name: 'aqiContextualInsightsFlow',
    inputSchema: AqiContextualInsightsInputSchema,
    outputSchema: AqiContextualInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await aqiContextualInsightsPrompt(input);
    if (!output) {
      throw new Error(
        'AI response was empty. This usually means the API key is missing, invalid, ' +
        'or the model is unavailable. Check your GOOGLE_GENAI_API_KEY in .env.local.'
      );
    }
    return output;
  },
);

