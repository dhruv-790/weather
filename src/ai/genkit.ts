import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn(
    '[Genkit] GOOGLE_GENAI_API_KEY is not set. AI features will fail. ' +
    'Copy .env.local.example to .env.local and add your API key.'
  );
}

export const ai = genkit({
  plugins: [googleAI({apiKey})],
  model: 'googleai/gemini-2.0-flash',
});

