'use server';
/**
 * @fileOverview An AI agent for recommending learning materials.
 *
 * - learningHubRecommendation - A function that handles the recommendation process.
 * - LearningHubRecommendationInput - The input type for the function.
 * - LearningHubRecommendationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ArticleSchema = z.object({
  id: z.string().describe('The unique identifier for the article.'),
  title: z.string().describe('The title of the article.'),
  description: z.string().describe('A brief description of the article.'),
});

const VideoSchema = z.object({
  id: z.string().describe('The unique identifier for the video.'),
  title: z.string().describe('The title of the video.'),
  description: z.string().describe('A brief description of the video.'),
});

const LearningHubRecommendationInputSchema = z.object({
  query: z.string().describe('The user\'s question about farming or crops.'),
  articles: z.array(ArticleSchema).describe('A list of available articles.'),
  videos: z.array(VideoSchema).describe('A list of available videos.'),
});
export type LearningHubRecommendationInput = z.infer<
  typeof LearningHubRecommendationInputSchema
>;

const RecommendedItemSchema = z.object({
  id: z
    .string()
    .describe('The ID of the recommended article or video, matching the input.'),
  reasoning: z
    .string()
    .describe('A brief, user-facing explanation for why this item was recommended.'),
});

const LearningHubRecommendationOutputSchema = z.object({
  articles: z
    .array(RecommendedItemSchema)
    .describe('A list of recommended articles. Return at most 2.'),
  videos: z
    .array(RecommendedItemSchema)
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
  prompt: `You are AgriVaani, an AI assistant for farmers. Your task is to recommend relevant learning materials based on a user's question.

Analyze the user's query and select the most relevant articles and videos from the provided lists.

- You can recommend up to 2 articles and up to 2 videos.
- If no content is relevant, return empty arrays for both 'articles' and 'videos'.
- For each recommendation, provide a short, user-friendly 'reasoning' for why it's a good match for their query.

User Query:
"{{{query}}}"

Available Articles:
{{#each articles}}
- ID: {{id}}, Title: "{{title}}", Description: "{{description}}"
{{/each}}

Available Videos:
{{#each videos}}
- ID: {{id}}, Title: "{{title}}", Description: "{{description}}"
{{/each}}
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
