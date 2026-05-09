'use server';

/**
 * @fileOverview An AI agent that analyzes an image of a meal to identify food items,
 * estimate their weight, and provide nutritional information.
 *
 * - analyzeMealImage - A function that handles the meal image analysis process.
 * - AnalyzeMealImageInput - The input type for the analyzeMealImage function.
 * - AnalyzeMealImageOutput - The return type for the analyzeMealImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealImageInputSchema = z.object({
  mealImage: z
    .string()
    .describe(
      'A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type AnalyzeMealImageInput = z.infer<typeof AnalyzeMealImageInputSchema>;

const AnalyzeMealImageOutputSchema = z.object({
  foodItems: z.array(
    z.object({
      foodName: z.string().describe('The name of the identified food item.'),
      weightGrams: z.number().describe('The estimated weight of the food item in grams.'),
      calories: z.number().describe('The total calories of the food item.'),
      proteinGrams: z.number().describe('The amount of protein in grams in the food item.'),
      carbsGrams: z.number().describe('The amount of carbohydrates in grams in the food item.'),
      fatGrams: z.number().describe('The amount of fat in grams in the food item.'),
    })
  ).describe('A list of food items identified in the meal image, with their nutritional information.'),
});
export type AnalyzeMealImageOutput = z.infer<typeof AnalyzeMealImageOutputSchema>;

export async function analyzeMealImage(input: AnalyzeMealImageInput): Promise<AnalyzeMealImageOutput> {
  return analyzeMealImageFlow(input);
}

const analyzeMealImagePrompt = ai.definePrompt({
  name: 'analyzeMealImagePrompt',
  input: {schema: AnalyzeMealImageInputSchema},
  output: {schema: AnalyzeMealImageOutputSchema},
  prompt: `Analyze the attached image of a meal. Identify every distinct food item and beverage. For each item, estimate its weight in grams and provide its nutritional information (total calories, protein in grams, carbohydrates in grams, and fat in grams). Return this information as a valid JSON array where each object represents a food item and has the following keys: 'foodName', 'weightGrams', 'calories', 'proteinGrams', 'carbsGrams', 'fatGrams'.

   {{media url=mealImage}}`,
});

const analyzeMealImageFlow = ai.defineFlow(
  {
    name: 'analyzeMealImageFlow',
    inputSchema: AnalyzeMealImageInputSchema,
    outputSchema: AnalyzeMealImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeMealImagePrompt(input);
    return output!;
  }
);
