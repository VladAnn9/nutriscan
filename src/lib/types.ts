export interface FoodItem {
  id: string;
  foodName: string;
  weightGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface Meal {
  id: string;
  name: string;
  timestamp: Date;
  foodItems: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export const DAILY_GOALS = {
  calories: 2000,
  proteinGrams: 100,
  carbsGrams: 250,
  fatGrams: 70,
};
