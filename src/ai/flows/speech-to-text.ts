'use server';
/**
 * @fileOverview A server-side speech-to-text transcription agent.
 *
 * - transcribeAudio - Transcribes audio data into text.
 * - TranscribeAudioInput - The input type for the function.
 * - TranscribeAudioOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audio: z
    .string()
    .describe(
      "Audio data as a data URI. Expected format: 'data:audio/webm;base64,...'"
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<
  typeof TranscribeAudioOutputSchema
>;

export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {
          media: {
            url: input.audio,
          },
        },
        { text: 'Transcribe the spoken words in the audio.' },
      ],
    });

    return { text };
  }
);
