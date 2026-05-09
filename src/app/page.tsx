'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { NutritionProgress } from '@/components/nutrition-progress';
import { MealScanner } from '@/components/meal-scanner';
import type { Meal, FoodItem } from '@/lib/types';
import { DAILY_GOALS } from '@/lib/types';
import { Apple, Pizza, Salad } from 'lucide-react';

export default function DashboardPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // To avoid hydration mismatches, all state relying on browser-specific APIs
    // like `new Date()` is initialized here, ensuring it only runs on the client.
    setCurrentDate(format(new Date(), 'eeee, MMMM d'));
    
    const breakfastTime = new Date();
    breakfastTime.setHours(8, 30, 0, 0);

    const lunchTime = new Date();
    lunchTime.setHours(12, 45, 0, 0);
    
    // In a real app, you would fetch today's meals from a database.
    // For this demo, we set initial mock data on the client.
    setMeals([
        {
            id: '1',
            name: 'Breakfast',
            timestamp: breakfastTime,
            foodItems: [{id: 'f1', foodName: 'Scrambled Eggs', weightGrams: 150, calories: 220, proteinGrams: 20, carbsGrams: 2, fatGrams: 15}],
            totalCalories: 220,
            totalProtein: 20,
            totalCarbs: 2,
            totalFat: 15,
        },
        {
            id: '2',
            name: 'Lunch',
            timestamp: lunchTime,
            foodItems: [{id: 'f2', foodName: 'Grilled Chicken Salad', weightGrams: 350, calories: 450, proteinGrams: 40, carbsGrams: 15, fatGrams: 25}],
            totalCalories: 450,
            totalProtein: 40,
            totalCarbs: 15,
            totalFat: 25,
        }
    ]);
    
    setIsClient(true);
  }, []);

  const dailyTotals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories;
        acc.proteinGrams += meal.totalProtein;
        acc.carbsGrams += meal.totalCarbs;
        acc.fatGrams += meal.totalFat;
        return acc;
      },
      { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 }
    );
  }, [meals]);

  const handleMealConfirmed = (mealName: string, foodItems: FoodItem[]) => {
    const newMeal: Meal = {
      id: new Date().toISOString(),
      name: mealName,
      timestamp: new Date(),
      foodItems,
      ...foodItems.reduce(
        (acc, item) => {
          acc.totalCalories += item.calories;
          acc.totalProtein += item.proteinGrams;
          acc.totalCarbs += item.carbsGrams;
          acc.totalFat += item.fatGrams;
          return acc;
        },
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
      ),
    };
    setMeals((prevMeals) => [...prevMeals, newMeal]);
    setIsSheetOpen(false);
  };
  
  const getMealIcon = (mealName: string) => {
    const lowerCaseName = mealName.toLowerCase();
    if (lowerCaseName.includes('breakfast')) return <Apple className="h-6 w-6 text-muted-foreground" />;
    if (lowerCaseName.includes('lunch')) return <Salad className="h-6 w-6 text-muted-foreground" />;
    if (lowerCaseName.includes('dinner')) return <Pizza className="h-6 w-6 text-muted-foreground" />;
    return <Icons.logo className="h-6 w-6 text-muted-foreground" />;
  }

  if (!isClient) {
    return null; // Render nothing on the server and initial client load to prevent hydration errors.
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <div className="flex items-center gap-2">
          <Icons.logo className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">NutriScan</h1>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">{currentDate}</div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="mx-auto grid w-full max-w-6xl gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <NutritionProgress dailyTotals={dailyTotals} goals={DAILY_GOALS} />
            </CardContent>
          </Card>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="w-full text-lg font-semibold shadow-md hover:shadow-lg transition-shadow">
                Scan New Meal
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] flex flex-col p-0 gap-0">
              <SheetHeader className="p-4 border-b">
                  <SheetTitle>Scan New Meal</SheetTitle>
              </SheetHeader>
              <div className='flex-grow overflow-y-auto'>
                <MealScanner onMealConfirmed={handleMealConfirmed} onCancel={() => setIsSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <Tabs defaultValue="today">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="history" disabled>History</TabsTrigger>
            </TabsList>
            <TabsContent value="today">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meals.length > 0 ? (
                      meals.map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between rounded-lg border p-4 animate-in fade-in-0 zoom-in-95 duration-300">
                          <div className="flex items-center gap-4">
                            {getMealIcon(meal.name)}
                            <div>
                                <p className="font-semibold">{meal.name}</p>
                                <p className="text-sm text-muted-foreground">{format(meal.timestamp, 'p')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{meal.totalCalories} kcal</p>
                            <p className="text-xs text-muted-foreground">
                              {meal.totalProtein}p / {meal.totalCarbs}c / {meal.totalFat}f
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No meals logged yet today.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
