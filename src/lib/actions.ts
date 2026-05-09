'use server';

import { analyzeMealImage } from '@/ai/flows/analyze-meal-image';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const analyzeImageSchema = z.object({
  image: z.string().min(1, { message: 'Image is required.' }),
});

export type FormState = {
  status: 'idle' | 'success' | 'error';
  items?: any[];
  message?: string;
  errors?: {
    image?: string[];
  };
};

export async function analyzeImageAction(prevState: FormState, formData: FormData): Promise<FormState> {
  console.log('--- SERVER LOG: analyzeImageAction started ---');
  try {
    const validatedFields = analyzeImageSchema.safeParse({
      image: formData.get('image'),
    });

    if (!validatedFields.success) {
      return {
        status: 'error',
        message: 'Validation failed.',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    
    const result = await analyzeMealImage({ mealImage: validatedFields.data.image });

    if (!result || !result.foodItems) {
        return {
            status: 'error',
            message: 'AI analysis failed to return items. Please try a clearer image.',
        };
    }

    const itemsWithIds = result.foodItems.map(item => ({
      ...item,
      id: randomUUID(),
    }));

    console.log(`--- SERVER LOG: Analysis successful, found ${itemsWithIds.length} items. ---`);

    return {
      status: 'success',
      items: itemsWithIds,
      message: 'Analysis successful!',
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      status: 'error',
      message: `An error occurred during analysis. ${errorMessage}`,
    };
  }
}
