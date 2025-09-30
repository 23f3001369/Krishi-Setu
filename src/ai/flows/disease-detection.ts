'use server';
/**
 * @fileOverview An AI agent for detecting crop diseases.
 *
 * - diseaseDetection - A function that handles the disease detection process.
 * - DiseaseDetectionInput - The input type for the function.
 * - DiseaseDetectionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiseaseDetectionInputSchema = z.object({
  cropImage: z
    .string()
    .describe(
      "A photo of a crop part (leaf, stem, etc.), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiseaseDetectionInput = z.infer<typeof DiseaseDetectionInputSchema>;

const DiseaseDetectionOutputSchema = z.object({
  diseaseName: z.string().describe('The name of the detected disease. If no disease is detected, this should state that the plant appears healthy.'),
  chemicalRemedies: z.string().describe('A list of suggested chemical remedies for the detected disease. Provide a comma-separated list.'),
  homemadeRemedies: z.string().describe('A list of suggested homemade or organic remedies for the detected disease. Provide a comma-separated list.'),
  isHealthy: z.boolean().describe('Whether the plant appears to be healthy or not.'),
});
export type DiseaseDetectionOutput = z.infer<typeof DiseaseDetectionOutputSchema>;

export async function diseaseDetection(
  input: DiseaseDetectionInput
): Promise<DiseaseDetectionOutput> {
  return diseaseDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diseaseDetectionPrompt',
  input: { schema: DiseaseDetectionInputSchema },
  output: { schema: DiseaseDetectionOutputSchema },
  prompt: `You are a specialized agricultural botanist with expertise in plant pathology.

Analyze the following image of a crop:
{{media url=cropImage}}

Your tasks are:
1. Identify if the crop is showing signs of any disease.
2. If a disease is present, identify it. If not, state that the plant appears healthy.
3. Suggest appropriate chemical remedies for the identified disease.
4. Suggest appropriate homemade or organic remedies for the identified disease.
5. Set the 'isHealthy' flag to true if no disease is detected, and false otherwise.

Provide the remedies as comma-separated lists.
`,
});

const diseaseDetectionFlow = ai.defineFlow(
  {
    name: 'diseaseDetectionFlow',
    inputSchema: DiseaseDetectionInputSchema,
    outputSchema: DiseaseDetectionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
