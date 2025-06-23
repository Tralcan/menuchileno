
import type { DailyMenu, CoreRecipe } from '@/ai/flows/generate-menu';
import type { SelectedRecipes } from '@/app/page';
import RecipeCard from './recipe-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CalendarDays, Utensils } from 'lucide-react';

interface MenuDisplayProps {
  menuData: DailyMenu[];
  selectedRecipes: SelectedRecipes;
  onRecipeSelect: (recipe: CoreRecipe, day: number, mealType: 'suggested' | 'optional', isSelected: boolean) => void;
  onViewRecipe: (recipe: CoreRecipe, day: number, mealTitle: string) => void;
  loadingImages: Record<string, boolean>;
}

export default function MenuDisplay({ menuData, selectedRecipes, onRecipeSelect, onViewRecipe, loadingImages }: MenuDisplayProps) {
  
  const getMealTitle = (isSuggested: boolean): string => {
    return isSuggested ? "Sugerido" : "Opcional";
  };

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-headline mb-8 text-center text-primary flex items-center justify-center gap-2">
        <Utensils size={32} /> Tus Opciones de Menú
      </h2>
      {menuData.length > 0 ? (
        <Accordion type="multiple" defaultValue={menuData.map(dayMenu => `day-${dayMenu.day}`)} className="w-full space-y-4">
          {menuData.map((dayMenu) => {
            const suggestedKey = `${dayMenu.suggestedLunch.recipeName}_${dayMenu.day}_suggested`;
            const optionalKey = `${dayMenu.optionalLunch.recipeName}_${dayMenu.day}_optional`;
            
            const suggestedRecipeKey = `day-${dayMenu.day}-suggested`;
            const optionalRecipeKey = `day-${dayMenu.day}-optional`;

            return (
            <AccordionItem value={`day-${dayMenu.day}`} key={dayMenu.day} className="bg-card rounded-lg shadow-md overflow-hidden border-none">
              <AccordionTrigger className="px-6 py-4 text-xl font-headline hover:bg-secondary/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-primary" /> Día {dayMenu.day}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Suggested Lunch Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3 p-4 border rounded-md bg-background hover:border-primary transition-all h-full">
                         <Checkbox 
                            id={suggestedRecipeKey} 
                            checked={!!selectedRecipes[suggestedRecipeKey]}
                            onCheckedChange={(checked) => onRecipeSelect(dayMenu.suggestedLunch, dayMenu.day, 'suggested', !!checked)}
                            className="mt-1"
                         />
                         <Label htmlFor={suggestedRecipeKey} className="flex-grow cursor-pointer">
                            <RecipeCard 
                              recipe={dayMenu.suggestedLunch}
                              dayNumber={dayMenu.day}
                              mealTitle={getMealTitle(true)}
                              onViewDetails={() => onViewRecipe(dayMenu.suggestedLunch, dayMenu.day, getMealTitle(true))}
                              isLoadingImage={loadingImages[suggestedKey] || false}
                            />
                         </Label>
                      </div>
                    </div>

                    {/* Optional Lunch Section */}
                    <div className="flex-1 space-y-3">
                       <div className="flex items-start gap-3 p-4 border rounded-md bg-background hover:border-primary transition-all h-full">
                          <Checkbox 
                            id={optionalRecipeKey}
                            checked={!!selectedRecipes[optionalRecipeKey]}
                            onCheckedChange={(checked) => onRecipeSelect(dayMenu.optionalLunch, dayMenu.day, 'optional', !!checked)}
                            className="mt-1"
                           />
                          <Label htmlFor={optionalRecipeKey} className="flex-grow cursor-pointer">
                            <RecipeCard 
                              recipe={dayMenu.optionalLunch} 
                              dayNumber={dayMenu.day}
                              mealTitle={getMealTitle(false)}
                              onViewDetails={() => onViewRecipe(dayMenu.optionalLunch, dayMenu.day, getMealTitle(false))}
                              isLoadingImage={loadingImages[optionalKey] || false}
                            />
                          </Label>
                       </div>
                    </div>
                  </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
        </Accordion>
      ) : (
        <p className="text-center text-muted-foreground">No hay opciones de menú para mostrar. Intenta generar algunas.</p>
      )}
    </section>
  );
}
