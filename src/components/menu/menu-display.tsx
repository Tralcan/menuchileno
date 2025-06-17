import type { DailyMenu, CoreRecipe } from '@/ai/flows/generate-menu';
import type { SelectedLunches, RecipeForModal } from '@/app/page';
import RecipeCard from './recipe-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarDays, Utensils, Soup, Salad } from 'lucide-react';

interface MenuDisplayProps {
  menuData: DailyMenu[];
  selectedLunches: SelectedLunches;
  onLunchSelect: (day: number, recipe: CoreRecipe) => void;
  onViewRecipe: (recipe: CoreRecipe, day: number, mealTitle: string) => void;
}

export default function MenuDisplay({ menuData, selectedLunches, onLunchSelect, onViewRecipe }: MenuDisplayProps) {
  
  const getMealTitle = (isSuggested: boolean): string => {
    return isSuggested ? "Almuerzo Sugerido" : "Almuerzo Opcional";
  };

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-headline mb-8 text-center text-primary flex items-center justify-center gap-2">
        <Utensils size={32} /> Tus Opciones de Menú
      </h2>
      {menuData.length > 0 ? (
        <Accordion type="multiple" defaultValue={menuData.map(dayMenu => `day-${dayMenu.day}`)} className="w-full space-y-4">
          {menuData.map((dayMenu) => (
            <AccordionItem value={`day-${dayMenu.day}`} key={dayMenu.day} className="bg-card rounded-lg shadow-md overflow-hidden border-none">
              <AccordionTrigger className="px-6 py-4 text-xl font-headline hover:bg-secondary/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-primary" /> Día {dayMenu.day}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4">
                <RadioGroup 
                  value={selectedLunches[dayMenu.day]?.recipeName || ""}
                  onValueChange={(recipeName) => {
                    const selectedRecipe = recipeName === dayMenu.suggestedLunch.recipeName 
                                          ? dayMenu.suggestedLunch 
                                          : dayMenu.optionalLunch;
                    onLunchSelect(dayMenu.day, selectedRecipe);
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-accent">
                      <Soup size={20} /> {getMealTitle(true)}
                    </h3>
                    <div className="flex items-start gap-3 p-4 border rounded-md bg-background hover:border-primary transition-all">
                       <RadioGroupItem value={dayMenu.suggestedLunch.recipeName} id={`day-${dayMenu.day}-suggested`} className="mt-1"/>
                       <Label htmlFor={`day-${dayMenu.day}-suggested`} className="flex-grow cursor-pointer">
                          <RecipeCard 
                            recipe={dayMenu.suggestedLunch}
                            dayNumber={dayMenu.day}
                            mealTitle={getMealTitle(true)}
                            onViewDetails={() => onViewRecipe(dayMenu.suggestedLunch, dayMenu.day, getMealTitle(true))}
                          />
                       </Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-lg font-semibold flex items-center gap-2 text-accent">
                       <Salad size={20} /> {getMealTitle(false)}
                     </h3>
                     <div className="flex items-start gap-3 p-4 border rounded-md bg-background hover:border-primary transition-all">
                        <RadioGroupItem value={dayMenu.optionalLunch.recipeName} id={`day-${dayMenu.day}-optional`} className="mt-1"/>
                        <Label htmlFor={`day-${dayMenu.day}-optional`} className="flex-grow cursor-pointer">
                          <RecipeCard 
                            recipe={dayMenu.optionalLunch} 
                            dayNumber={dayMenu.day}
                            mealTitle={getMealTitle(false)}
                            onViewDetails={() => onViewRecipe(dayMenu.optionalLunch, dayMenu.day, getMealTitle(false))}
                          />
                        </Label>
                     </div>
                  </div>
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-center text-muted-foreground">No hay opciones de menú para mostrar. Intenta generar algunas.</p>
      )}
    </section>
  );
}
