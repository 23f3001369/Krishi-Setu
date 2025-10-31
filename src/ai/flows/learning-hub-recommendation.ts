
'use server';
/**
 * @fileOverview An AI agent for recommending learning materials from the web.
 *
 * - learningHubRecommendation - A function that handles the recommendation process.
 * - LearningHubRecommendationInput - The input type for the function.
 * - LearningHubRecommendationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecommendedArticleSchema = z.object({
  title: z.string().describe('The title of the recommended article.'),
  link: z.string().url().describe('A direct link to the article.'),
  source: z.string().describe('The website where the article was found (e.g., "agriculturejournal.org").'),
  reasoning: z
    .string()
    .describe('A brief, user-facing explanation for why this item was recommended.'),
});

const RecommendedVideoSchema = z.object({
  title: z.string().describe('The title of the recommended YouTube video.'),
  link: z.string().url().describe('A direct link to the YouTube video.'),
  reasoning: z
    .string()
    .describe('A brief, user-facing explanation for why this item was recommended.'),
});

const LearningHubRecommendationInputSchema = z.object({
  query: z.string().describe('The user\'s question about farming or crops.'),
});
export type LearningHubRecommendationInput = z.infer<
  typeof LearningHubRecommendationInputSchema
>;

const LearningHubRecommendationOutputSchema = z.object({
  articles: z
    .array(RecommendedArticleSchema)
    .describe('A list of recommended articles. Return at most 2.'),
  videos: z
    .array(RecommendedVideoSchema)
    .describe('A list of recommended videos. Return at most 2.'),
});
export type LearningHubRecommendationOutput = z.infer<
  typeof LearningHubRecommendationOutputSchema
>;

export async function learningHubRecommendation(
  input: LearningHubRecommendationInput
): Promise<LearningHubRecommendationOutput> {
  return learningHubRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningHubRecommendationPrompt',
  input: { schema: LearningHubRecommendationInputSchema },
  output: { schema: LearningHubRecommendationOutputSchema },
  prompt: `You are Krishi-Bot, an AI assistant for farmers. Your task is to act as a search engine to recommend relevant, existing learning materials from specific online sources based on a user's question.

Analyze the user's query and find the most relevant articles and videos.

- You MUST search for actual, publicly accessible videos ONLY on youtube.com.
- You MUST search for actual, publicly accessible articles ONLY from these websites: https://www.agriculturejournal.org/, https://agriarticles.com/, and https://epubs.icar.org.in/index.php/IndFarm.
- The links you provide MUST be valid, working URLs. Do not provide dummy or placeholder links.
- Recommend up to 2 articles and up to 2 videos.
- For each recommendation, provide the title, a direct link, the source (for articles), and a short 'reasoning' for why it's a good match.
- If no relevant content is found, return empty arrays.

User Query:
"{{{query}}}"
`,
});

const learningHubRecommendationFlow = ai.defineFlow(
  {
    name: 'learningHubRecommendationFlow',
    inputSchema: LearningHubRecommendationInputSchema,
    outputSchema: LearningHubRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
