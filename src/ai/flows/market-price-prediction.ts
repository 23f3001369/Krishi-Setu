
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
  predictedPrice: z.string().describe('The predicted price range in Indian Rupees (Rs.) per standard unit (e.g., "Rs. 1800 - Rs. 2200 per quintal").'),
  trend: z.enum(['upward', 'downward', 'stable']).describe('The most likely anticipated price trend over the next 2-4 weeks.'),
  trendConfidence: z.object({
      upward: z.number().describe('The confidence percentage (0-100) that the price trend will be upward.'),
      downward: z.number().describe('The confidence percentage (0-100) that the price trend will be downward.'),
      stable: z.number().describe('The confidence percentage (0-100) that the price trend will be stable.'),
  }).describe('The confidence levels for each possible trend. The sum of upward, downward, and stable must be 100.'),
  reasoning: z.string().describe('A brief explanation for the prediction, mentioning factors like seasonality, demand, and recent events.'),
});


const prompt = ai.definePrompt({
  name: 'marketPricePredictionPrompt',
  input: { schema: MarketPricePredictionInputSchema },
  output: { schema: MarketPricePredictionOutputSchema },
  config: {
    temperature: 0.2,
  },
  prompt: `You are an expert agricultural market analyst in India. Your task is to predict the market price for a specific crop by using your knowledge of data from sources like napanta.com as of November 2025.

Act like a search engine. Use the user's input to find the most relevant market price and then generate a prediction based on that.

Crop: {{{cropName}}}
Market/Region: {{{marketLocation}}}

Based on your knowledge, provide the following:
1.  A predicted price range in Indian Rupees (Rs.) per quintal for the next 2-4 weeks from November 2025.
2.  The most likely price trend for the next 2-4 weeks (upward, downward, or stable).
3.  A confidence score for each of the three possible trends (upward, downward, stable). These three scores MUST sum to 100.
4.  A concise reasoning for your prediction, considering factors like seasonality, demand, supply, and any relevant events based on your knowledge from napanta.com.

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
