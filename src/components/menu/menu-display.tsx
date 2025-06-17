import type { GenerateMenuOutput } from '@/ai/flows/generate-menu';
import RecipeCard from './recipe-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarDays, Utensils } from 'lucide-react';

type MenuData = GenerateMenuOutput["menu"];
type Recipe = Extract<GenerateMenuOutput["menu"][number], { recipeName: string }>;

interface MenuDisplayProps {
  menuData: MenuData;
  onViewRecipe: (recipe: Recipe) => void;
}

export default function MenuDisplay({ menuData, onViewRecipe }: MenuDisplayProps) {
  const groupedMenu = menuData.reduce((acc, meal) => {
    const day = meal.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(meal as Recipe); // Cast as Recipe
    return acc;
  }, {} as Record<number, Recipe[]>);

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-headline mb-6 text-center text-primary flex items-center justify-center gap-2">
        <Utensils size={32} /> Tu Menú Semanal
      </h2>
      {Object.keys(groupedMenu).length > 0 ? (
        <Accordion type="multiple" defaultValue={Object.keys(groupedMenu).map(day => `day-${day}`)} className="w-full">
          {Object.entries(groupedMenu).map(([day, meals]) => (
            <AccordionItem value={`day-${day}`} key={day} className="mb-4 bg-card rounded-lg shadow-md overflow-hidden">
              <AccordionTrigger className="px-6 py-4 text-xl font-headline hover:bg-secondary/50">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-primary" /> Día {day}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meals.map((meal, index) => (
                     meal.recipeName ? ( // Check if recipeName exists
                      <RecipeCard 
                        key={`${day}-${index}-${meal.recipeName}`} 
                        recipe={meal} 
                        onViewDetails={() => onViewRecipe(meal)}
                        // onSuggestReplacement={() => console.log("Suggest replacement for:", meal.recipeName)} // Placeholder
                      />
                    ) : null // Or some placeholder for meals without recipeName
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-center text-muted-foreground">No hay menú para mostrar. Intenta generar uno.</p>
      )}
    </section>
  );
}
