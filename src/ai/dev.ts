import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-meal-image.ts';
import '@/ai/flows/summarize-daily-nutrition.ts';
import '@/ai/flows/suggest-food-alternatives.ts';