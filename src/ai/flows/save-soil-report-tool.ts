
'use server';
/**
 * @fileOverview A Genkit tool for saving soil health reports to Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const SaveSoilReportInputSchema = z.object({
  farmerId: z.string().describe("The farmer's user ID."),
  reportText: z.string().describe("The text content of the soil report."),
  reportImage: z.string().optional().describe("The data URI of the soil report image, if available."),
});
export type SaveSoilReportInput = z.infer<typeof SaveSoilReportInputSchema>;

export const saveSoilReportTool = ai.defineTool(
  {
    name: 'saveSoilReportTool',
    description: 'Saves a soil health report to the database for a specific user.',
    input: { schema: SaveSoilReportInputSchema },
    output: { schema: z.object({ success: z.boolean(), docId: z.string().optional() }) },
  },
  async (input) => {
    try {
      // Initialize Firebase admin SDK to use Firestore on the server-side
      const { firestore } = initializeFirebase();
      
      const soilReportsRef = collection(firestore, `farmers/${input.farmerId}/soilReports`);
      
      const docRef = await addDoc(soilReportsRef, {
        farmerId: input.farmerId,
        reportText: input.reportText,
        reportImage: input.reportImage || null,
        createdAt: serverTimestamp(),
      });

      console.log("Soil report saved with ID: ", docRef.id);
      return { success: true, docId: docRef.id };
    } catch (error) {
      console.error("Error saving soil report:", error);
      // In a real app, you might want to throw an error or return a more detailed error object
      return { success: false };
    }
  }
);
