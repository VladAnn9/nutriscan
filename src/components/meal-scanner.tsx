'use client';

import { useState, useRef, useEffect, useTransition, useActionState } from 'react';
import Image from 'next/image';
import { analyzeImageAction, type FormState } from '@/lib/actions';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Plus, Loader2, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loadingMessages = [
  "Analyzing your meal...",
  "Identifying ingredients...",
  "Calculating nutrients...",
  "Almost there...",
];

interface MealScannerProps {
  onMealConfirmed: (mealName: string, items: FoodItem[]) => void;
  onCancel: () => void;
}

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(img.src);
      resolve(dataUrl);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(img.src);
      reject(error);
    };
  });
};


export function MealScanner({ onMealConfirmed, onCancel }: MealScannerProps) {
  const initialState: FormState = { status: 'idle' };
  const [formState, formAction] = useActionState(analyzeImageAction, initialState);
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<FoodItem[]>([]);
  const [mealName, setMealName] = useState('My Meal');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      const objectUrl = imagePreview;
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [imagePreview]);

  useEffect(() => {
    if (isPending) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPending]);

  useEffect(() => {
    if (formState.status === 'success' && formState.items) {
      setItems(formState.items as FoodItem[]);
      setImagePreview(null);
      toast({ title: 'Success', description: 'Meal analysis complete!' });
    }
    if (formState.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: formState.message,
      });
      setImagePreview(null);
    }
  }, [formState, toast]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        const resizedImageBase64 = await resizeImage(file, 1024, 1024);

        const hiddenInput = document.getElementById('image-base64') as HTMLInputElement;
        if (hiddenInput) {
          hiddenInput.value = resizedImageBase64;
        }

        startTransition(() => {
          formRef.current?.requestSubmit();
        });
      } catch (error) {
        console.error("Failed to process image:", error);
        toast({
          variant: 'destructive',
          title: 'Image Processing Error',
          description: 'There was a problem preparing your image. Please try again.',
        });
        setImagePreview(null);
      }
    }
  };

  const handleUpdateItem = (id: string, field: keyof FoodItem, value: string | number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, [field]: typeof value === 'string' ? value : Number(value) } : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: new Date().toISOString(),
        foodName: '',
        weightGrams: 100,
        calories: 0,
        proteinGrams: 0,
        carbsGrams: 0,
        fatGrams: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <p className="text-xl font-semibold text-foreground">{loadingMessages[loadingMessageIndex]}</p>
          <p className="text-muted-foreground">This may take a moment.</p>
        </div>
      );
    }

    if (items.length > 0) {
      return (
        <div className="flex flex-col h-full">
            <Input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g., Lunch, Post-Workout Snack"
                className="text-lg font-bold mb-4"
            />
          <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="p-4 animate-in fade-in-0 zoom-in-95 duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <Input
                      id={`foodName-${item.id}`}
                      placeholder="Food Name"
                      value={item.foodName}
                      onChange={(e) => handleUpdateItem(item.id, 'foodName', e.target.value)}
                      className="text-lg font-semibold border-0 shadow-none p-0 focus-visible:ring-0 h-auto"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mt-1 -mr-2" onClick={() => handleRemoveItem(item.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`weight-${item.id}`} className="text-xs text-muted-foreground">Weight (g)</Label>
                      <Input
                        id={`weight-${item.id}`}
                        type="number"
                        value={item.weightGrams}
                        onChange={(e) => handleUpdateItem(item.id, 'weightGrams', e.target.value)}
                        className="mt-1"
                        aria-label="Weight in grams"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`calories-${item.id}`} className="text-xs text-muted-foreground">Calories (kcal)</Label>
                      <Input
                        id={`calories-${item.id}`}
                        type="number"
                        value={item.calories}
                        onChange={(e) => handleUpdateItem(item.id, 'calories', e.target.value)}
                        className="mt-1"
                        aria-label="Calories"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <form ref={formRef} action={formAction}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <input type="hidden" id="image-base64" name="image" />
            </form>

            <div
                className="w-full max-w-md h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-ai-hint="plate food"
            >
                {imagePreview ? (
                <Image src={imagePreview} alt="Meal preview" width={256} height={256} className="object-cover rounded-lg h-full w-full" />
                ) : (
                <>
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">Scan Your Meal</h2>
                    <p className="text-muted-foreground">Tap to upload a photo</p>
                </>
                )}
            </div>
            
            <Alert className="mt-8 max-w-md">
                <AlertTitle>How it works</AlertTitle>
                <AlertDescription>
                    1. Tap above to take or upload a photo of your meal.
                    <br />
                    2. Our AI will analyze the food items and their nutrition.
                    <br />
                    3. Review, adjust, and add to your daily log!
                </AlertDescription>
            </Alert>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full p-4 bg-background">
      <div className="flex-grow overflow-hidden relative">{renderContent()}</div>
      
      <div className="flex-shrink-0 pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={handleAddItem} disabled={isPending || items.length === 0}>
                <Plus className="h-4 w-4 mr-2"/> Add Item
            </Button>
            <div className="text-right">
                <p className="text-2xl font-bold">{totalCalories} kcal</p>
                <p className="text-sm text-muted-foreground">Total Meal Calories</p>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" size="lg" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={() => onMealConfirmed(mealName, items)}
            disabled={isPending || items.length === 0}
            className="font-bold"
          >
            <Check className="mr-2 h-5 w-5"/>
            Confirm & Add to Diary
          </Button>
        </div>
      </div>
    </div>
  );
}
