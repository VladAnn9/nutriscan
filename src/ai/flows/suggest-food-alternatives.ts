// use server'
'use server';

/**
 * @fileOverview AI agent that suggests alternative food choices with different nutritional profiles.
 *
 * - suggestFoodAlternatives - A function that handles the suggestion of food alternatives.
 * - SuggestFoodAlternativesInput - The input type for the suggestFoodAlternatives function.
 * - SuggestFoodAlternativesOutput - The return type for the suggestFoodAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFoodAlternativesInputSchema = z.object({
  foodName: z.string().describe('The name of the food item to find alternatives for.'),
  calories: z.number().describe('The number of calories in the food item.'),
  proteinGrams: z.number().describe('The amount of protein in grams in the food item.'),
  carbsGrams: z.number().describe('The amount of carbohydrates in grams in the food item.'),
  fatGrams: z.number().describe('The amount of fat in grams in the food item.'),
});
export type SuggestFoodAlternativesInput = z.infer<typeof SuggestFoodAlternativesInputSchema>;

const SuggestFoodAlternativesOutputSchema = z.array(
  z.object({
    foodName: z.string().describe('The name of the alternative food item.'),
    calories: z.number().describe('The number of calories in the alternative food item.'),
    proteinGrams: z.number().describe('The amount of protein in grams in the alternative food item.'),
    carbsGrams: z.number().describe('The amount of carbohydrates in grams in the alternative food item.'),
    fatGrams: z.number().describe('The amount of fat in grams in the alternative food item.'),
    reason: z.string().describe('Why this food is a good alternative.'),
  })
).describe('An array of alternative food suggestions with their nutritional information and reasoning.');
export type SuggestFoodAlternativesOutput = z.infer<typeof SuggestFoodAlternativesOutputSchema>;

export async function suggestFoodAlternatives(input: SuggestFoodAlternativesInput): Promise<SuggestFoodAlternativesOutput> {
  return suggestFoodAlternativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFoodAlternativesPrompt',
  input: {schema: SuggestFoodAlternativesInputSchema},
  output: {schema: SuggestFoodAlternativesOutputSchema},
  prompt: `You are a nutrition expert. A user is trying to find a healthier alternative to a particular food item.

You will be provided with the name and nutritional information for a food item. Your task is to suggest up to 3 alternative food items that are healthier, with their nutritional information, and a short explanation as to why each suggestion is a good alternative.

Food Item: {{{foodName}}}
Calories: {{{calories}}} kcal
Protein: {{{proteinGrams}}} g
Carbohydrates: {{{carbsGrams}}} g
Fat: {{{fatGrams}}} g

Respond in JSON format.
`,
});

const suggestFoodAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestFoodAlternativesFlow',
    inputSchema: SuggestFoodAlternativesInputSchema,
    outputSchema: SuggestFoodAlternativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
