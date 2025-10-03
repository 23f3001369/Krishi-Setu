'use server';
/**
 * @fileOverview An AI agent for extracting text from a soil health card image.
 *
 * - extractSoilHealthInfo - A function that handles the extraction process.
 * - ExtractSoilHealthInfoInput - The input type for the function.
 * - ExtractSoilHealthInfoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractSoilHealthInfoInputSchema = z.object({
  soilHealthCardImage: z
    .string()
    .describe(
      "A photo of the soil health card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractSoilHealthInfoInput = z.infer<
  typeof ExtractSoilHealthInfoInputSchema
>;

const ExtractSoilHealthInfoOutputSchema = z.object({
  soilAnalysisText: z
    .string()
    .describe(
      'The extracted soil analysis details as a formatted string, including values like pH, Nitrogen, Phosphorus, Potassium, etc.'
    ),
});
export type ExtractSoilHealthInfoOutput = z.infer<
  typeof ExtractSoilHealthInfoOutputSchema
>;

export async function extractSoilHealthInfo(
  input: ExtractSoilHealthInfoInput
): Promise<ExtractSoilHealthInfoOutput> {
  return extractSoilHealthInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractSoilHealthInfoPrompt',
  input: { schema: ExtractSoilHealthInfoInputSchema },
  output: { schema: ExtractSoilHealthInfoOutputSchema },
  prompt: `You are an expert Optical Character Recognition (OCR) tool specialized in agricultural documents.

Your task is to extract the key soil health parameters and their values from the provided image of a Soil Health Card.

Image of Soil Health Card: {{media url=soilHealthCardImage}}

Please identify and extract the following details, and format them as a clear, readable text block. For example: "pH: 6.8, Nitrogen: High, Phosphorus: Medium, Potassium: Low, Organic Matter: 3.5%".

- pH
- Organic Carbon (%)
- Nitrogen (N) (kg/ha)
- Phosphorus (P) (kg/ha)
- Potassium (K) (kg/ha)
- Sulphur (S) (kg/ha)
- Zinc (Zn) (mg/kg)
- Boron (B) (mg/kg)
- Iron (Fe) (mg/kg)

Return only the extracted text.`,
});

const extractSoilHealthInfoFlow = ai.defineFlow(
  {
    name: 'extractSoilHealthInfoFlow',
    inputSchema: ExtractSoilHealthInfoInputSchema,
    outputSchema: ExtractSoilHealthInfoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
