'use client';

import { Progress } from '@/components/ui/progress';

interface NutritionProgressProps {
  dailyTotals: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  goals: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
}

const NutrientBar = ({
  label,
  value,
  goal,
  unit,
  colorClass,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  colorClass: string;
}) => {
  const percentage = goal > 0 ? (value / goal) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>
          {Math.round(value)} / {goal} {unit}
        </span>
      </div>
      <Progress value={percentage} className="h-3 [&>div]:transition-all [&>div]:duration-500" indicatorClassName={colorClass} />
    </div>
  );
};

export function NutritionProgress({ dailyTotals, goals }: NutritionProgressProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <NutrientBar
        label="Calories"
        value={dailyTotals.calories}
        goal={goals.calories}
        unit="kcal"
        colorClass="bg-chart-1"
      />
      <NutrientBar
        label="Protein"
        value={dailyTotals.proteinGrams}
        goal={goals.proteinGrams}
        unit="g"
        colorClass="bg-chart-2"
      />
      <NutrientBar
        label="Carbs"
        value={dailyTotals.carbsGrams}
        goal={goals.carbsGrams}
        unit="g"
        colorClass="bg-chart-4"
      />
      <NutrientBar
        label="Fat"
        value={dailyTotals.fatGrams}
        goal={goals.fatGrams}
        unit="g"
        colorClass="bg-chart-5"
      />
    </div>
  );
}

// Add this to progress.tsx to allow custom indicator colors
declare module "react" {
    interface ComponentPropsWithoutRef<T extends React.ElementType> {
        indicatorClassName?: string;
    }
}
