
'use server';
/**
 * @fileOverview An AI agent for predicting market prices of crops.
 *
 * - marketPricePrediction - Predicts the market price for a given crop.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCropPrice } from '@/lib/market-data';

// Input and Output schemas are now defined in the client component
// to adhere to 'use server' constraints.
import type { MarketPricePredictionInput, MarketPricePredictionOutput } from '@/app/dashboard/market-price-prediction/page';


const getMarketPriceTool = ai.defineTool(
    {
        name: 'getMarketPrice',
        description: 'Get the current market price of a specific crop in a given location.',
        inputSchema: z.object({
            crop: z.string().describe('The name of the crop.'),
            location: z.string().describe('The market location (e.g., state or city).'),
        }),
        outputSchema: z.object({
            price: z.number().describe('The current price per quintal.'),
        }),
    },
    async (input) => getCropPrice(input.crop, input.location)
);


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
  tools: [getMarketPriceTool],
  config: {
    temperature: 0.2,
  },
  prompt: `You are an expert agricultural market analyst in India. Your task is to predict the market price for a specific crop, using data as of November 2025 from napanta.com.

First, use the getMarketPrice tool to fetch the current price for the given crop and location. This tool provides the most recently updated price.

Crop: {{{cropName}}}
Market/Region: {{{marketLocation}}}

Based on the current price obtained from the tool, and considering market dynamics and seasonal trends as of November 2025, provide the following:
1.  A predicted price range in Indian Rupees (Rs) per quintal for the next 2-4 weeks. This range should be anchored realistically around the current price.
2.  The likely price trend for the next 2-4 weeks (upward, downward, or stable).
3.  A concise reasoning for your prediction, considering factors like seasonality, demand, supply, and any relevant events based on your knowledge from napanta.com.

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
