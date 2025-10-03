
'use server';
/**
 * @fileOverview An AI agent for generating a detailed crop cultivation guide.
 *
 * - generateCultivationGuide - The main function to call the flow.
 * - GenerateCultivationGuideInput - Input schema for the flow.
 * - GenerateCultivationGuideOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCultivationGuideInputSchema = z.object({
  crop: z.string().describe('The name of the crop to be cultivated.'),
  variety: z.string().optional().describe('The specific variety of the crop, if known.'),
  area: z.number().describe('The size of the cultivation area in acres.'),
  currentWeather: z.string().describe('A description of the current local weather conditions (e.g., temperature, humidity, season).'),
  soilHealth: z.string().describe('A description of the soil health (e.g., pH, nutrient levels, texture).'),
});
export type GenerateCultivationGuideInput = z.infer<typeof GenerateCultivationGuideInputSchema>;

const CultivationStageSchema = z.object({
  name: z.string().describe('The name of the cultivation stage (e.g., "Planting", "Vegetative Growth").'),
  status: z.enum(['completed', 'active', 'upcoming']).describe('The current status of this stage.'),
  duration: z.string().describe('The estimated duration of this stage (e.g., "Day 1-5").'),
  aiInstruction: z.string().describe('A detailed, user-friendly instruction from the AI for this specific stage.'),
  pestAndDiseaseAlert: z.string().optional().describe('A specific alert for pests or diseases relevant to this stage and region.'),
  tasks: z.array(z.string()).describe('A list of key tasks to be completed during this stage.'),
});
export type CultivationStage = z.infer<typeof CultivationStageSchema>;

const GenerateCultivationGuideOutputSchema = z.object({
    crop: z.string().describe("The crop name provided in the input."),
    variety: z.string().describe("The crop variety, either from input or recommended by the AI."),
    estimatedDurationDays: z.number().describe("The total estimated duration of the entire cultivation cycle in days."),
    estimatedExpenses: z.number().describe("A rough estimate of the total expenses in the local currency for the given area."),
    stages: z.array(CultivationStageSchema).describe("An array of all cultivation stages from planting to harvest.")
});
export type GenerateCultivationGuideOutput = z.infer<typeof GenerateCultivationGuideOutputSchema>;


export async function generateCultivationGuide(input: GenerateCultivationGuideInput): Promise<GenerateCultivationGuideOutput> {
  return generateCultivationGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCultivationGuidePrompt',
  input: { schema: GenerateCultivationGuideInputSchema },
  output: { schema: GenerateCultivationGuideOutputSchema },
  prompt: `You are an expert agronomist AI assistant. Your task is to generate a comprehensive, stage-by-stage cultivation guide for a farmer.

The farmer has provided the following details:
- Crop: {{{crop}}}
{{#if variety}}- Variety: {{{variety}}}{{else}}- Variety: Please recommend a suitable, high-yield variety for the described conditions.{{/if}}
- Area: {{{area}}} acres
- Current Weather: {{{currentWeather}}}
- Soil Health: {{{soilHealth}}}

Based on this information, create a complete cultivation plan. The plan must include:
1.  **Crop and Variety**: Confirm the crop name. If the user didn't provide a variety, recommend a common, high-yield one suitable for the conditions.
2.  **Estimated Duration**: Provide a total estimated duration for the entire crop cycle in days.
3.  **Estimated Expenses**: Provide a rough, lump-sum estimate of the total cultivation expenses for the given area.
4.  **Stages**: Break down the entire process into distinct stages (e.g., Land Preparation, Planting, Germination, Vegetative Growth, Flowering, Fruiting, Harvest).
    - For each stage, define its 'name', 'duration' (e.g., "Day 1-5"), and 'status'. The first stage should be 'active', and all subsequent stages should be 'upcoming'. The 'completed' status is for future use.
    - Provide a detailed 'aiInstruction' for each stage, explaining what the farmer needs to do and look out for.
    - If relevant for the stage, provide a 'pestAndDiseaseAlert' based on common issues for that crop.
    - List a few simple, actionable 'tasks' for the farmer to perform during that stage.

Generate the response in the required JSON format.
`,
});

const generateCultivationGuideFlow = ai.defineFlow(
  {
    name: 'generateCultivationGuideFlow',
    inputSchema: GenerateCultivationGuideInputSchema,
    outputSchema: GenerateCultivationGuideOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
