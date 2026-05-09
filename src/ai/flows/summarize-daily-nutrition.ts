// 'use server';

/**
 * @fileOverview Summarizes the user's daily nutritional intake, highlighting deficiencies or excesses.
 *
 * - summarizeDailyNutrition - A function that handles the summarization of daily nutritional intake.
 * - SummarizeDailyNutritionInput - The input type for the summarizeDailyNutrition function.
 * - SummarizeDailyNutritionOutput - The return type for the summarizeDailyNutrition function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyNutritionInputSchema = z.object({
  mealsData: z.array(
    z.object({
      foodName: z.string(),
      weightGrams: z.number(),
      calories: z.number(),
      proteinGrams: z.number(),
      carbsGrams: z.number(),
      fatGrams: z.number(),
    })
  ).describe('An array of meal objects, each containing nutritional information.'),
  recommendedDailyValues: z.object({
    calories: z.number().describe('Recommended daily calorie intake.'),
    proteinGrams: z.number().describe('Recommended daily protein intake in grams.'),
    carbsGrams: z.number().describe('Recommended daily carbohydrate intake in grams.'),
    fatGrams: z.number().describe('Recommended daily fat intake in grams.'),
  }).describe('Recommended daily values for calories, protein, carbs, and fat.'),
});

export type SummarizeDailyNutritionInput = z.infer<typeof SummarizeDailyNutritionInputSchema>;

const SummarizeDailyNutritionOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s daily nutritional intake, highlighting any deficiencies or excesses based on recommended daily values.'),
});

export type SummarizeDailyNutritionOutput = z.infer<typeof SummarizeDailyNutritionOutputSchema>;

export async function summarizeDailyNutrition(input: SummarizeDailyNutritionInput): Promise<SummarizeDailyNutritionOutput> {
  return summarizeDailyNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDailyNutritionPrompt',
  input: {schema: SummarizeDailyNutritionInputSchema},
  output: {schema: SummarizeDailyNutritionOutputSchema},
  prompt: `You are a nutritionist providing a summary of a user's daily nutritional intake.

  Analyze the provided meal data and compare it against the recommended daily values.

  Highlight any potential deficiencies or excesses in calories, protein, carbohydrates, and fat.

  Provide a concise summary that helps the user make informed dietary adjustments.

  Meal Data:
  {{#each mealsData}}
  - {{foodName}}: {{weightGrams}}g, {{calories}} kcal, Protein: {{proteinGrams}}g, Carbs: {{carbsGrams}}g, Fat: {{fatGrams}}g
  {{/each}}

  Recommended Daily Values:
  - Calories: {{recommendedDailyValues.calories}} kcal
  - Protein: {{recommendedDailyValues.proteinGrams}}g
  - Carbs: {{recommendedDailyValues.carbsGrams}}g
  - Fat: {{recommendedDailyValues.fatGrams}}g`,
});

const summarizeDailyNutritionFlow = ai.defineFlow(
  {
    name: 'summarizeDailyNutritionFlow',
    inputSchema: SummarizeDailyNutritionInputSchema,
    outputSchema: SummarizeDailyNutritionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
