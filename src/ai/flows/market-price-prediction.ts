
'use server';
/**
 * @fileOverview An AI agent for predicting market prices of crops.
 *
 * - marketPricePrediction - Predicts the market price for a given crop.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input and Output schemas are now defined in the client component
// to adhere to 'use server' constraints.
import type { MarketPricePredictionInput, MarketPricePredictionOutput } from '@/app/dashboard/market-price-prediction/page';

export async function marketPricePrediction(input: MarketPricePredictionInput): Promise<MarketPricePredictionOutput> {
  return marketPricePredictionFlow(input);
}

// Schemas are defined here for the flow's internal use but are not exported.
const MarketPricePredictionInputSchema = z.object({
  cropName: z.string().describe('The name of the crop (e.g., "Wheat", "Tomato").'),
  marketLocation: z.string().describe('The name of the market or region (e.g., "Nashik, Maharashtra", "Indore").'),
});

const MarketPricePredictionOutputSchema = z.object({
  predictedPrice: z.string().describe('The predicted price range in Indian Rupees (Rs) per standard unit (e.g., "Rs 1800 - Rs 2200 per quintal").'),
  trend: z.enum(['upward', 'downward', 'stable']).describe('The anticipated price trend over the next 2-4 weeks.'),
  reasoning: z.string().describe('A brief explanation for the prediction, mentioning factors like seasonality, demand, and recent events.'),
});

const prompt = ai.definePrompt({
  name: 'marketPricePredictionPrompt',
  input: { schema: MarketPricePredictionInputSchema },
  output: { schema: MarketPricePredictionOutputSchema },
  config: {
    temperature: 0.2,
  },
  prompt: `You are an expert agricultural market analyst in India. Your task is to predict the market price for a specific crop.

Crop: {{{cropName}}}
Market/Region: {{{marketLocation}}}

Based on real-time data from commodityonline.com, current market dynamics, and seasonal trends, provide the following:
1.  A predicted price range in Indian Rupees (Rs) per quintal.
2.  The likely price trend for the next 2-4 weeks (upward, downward, or stable).
3.  A concise reasoning for your prediction, considering factors like seasonality, demand, supply, and recent weather events or government policies.

Generate the response in the required JSON format.
`,
});

const marketPricePredictionFlow = ai.defineFlow(
  {
    name: 'marketPricePredictionFlow',
    inputSchema: MarketPricePredictionInputSchema,
    outputSchema: MarketPricePredictionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
