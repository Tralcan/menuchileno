import type { GenerateMenuOutput } from '@/ai/flows/generate-menu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UtensilsCrossed, CalendarDays, Zap } from "lucide-react";

type Recipe = Extract<GenerateMenuOutput["menu"][number], { recipeName: string }>;

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: () => void;
  onSuggestReplacement?: () => void; // Optional for now
}

export default function RecipeCard({ recipe, onViewDetails, onSuggestReplacement }: RecipeCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <CardHeader>
        <div className="relative h-48 w-full mb-4 rounded-t-md overflow-hidden">
          <Image 
            src={`https://placehold.co/600x400.png?${encodeURIComponent(recipe.recipeName)}`} 
            alt={recipe.recipeName} 
            layout="fill" 
            objectFit="cover"
            data-ai-hint="food meal"
            className="transition-transform duration-300 group-hover:scale-105"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
           <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
              {recipe.meal}
            </div>
        </div>
        <CardTitle className="font-headline text-xl leading-tight">{recipe.recipeName}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <CalendarDays size={16} className="mr-1.5" /> Día {recipe.day}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3">{recipe.instructions.substring(0,100)}...</p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t">
        <Button onClick={onViewDetails} variant="outline" className="w-full sm:w-auto">
          <UtensilsCrossed size={16} className="mr-2" />
          Ver Receta
        </Button>
        {onSuggestReplacement && (
          <Button onClick={onSuggestReplacement} variant="ghost" className="w-full sm:w-auto text-accent hover:text-accent/90">
             <Zap size={16} className="mr-2" />
            Sugerir Otra
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
