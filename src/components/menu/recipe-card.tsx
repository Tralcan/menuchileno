
import type { CoreRecipe } from '@/ai/flows/generate-menu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UtensilsCrossed, CalendarDays, Loader2 } from "lucide-react";

interface RecipeCardProps {
  recipe: CoreRecipe; // CoreRecipe now includes imageDataUri?: string
  dayNumber: number;
  mealTitle: string;
  onViewDetails: () => void;
  isLoadingImage?: boolean;
}

export default function RecipeCard({ recipe, dayNumber, mealTitle, onViewDetails, isLoadingImage }: RecipeCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden w-full">
      <CardHeader className="p-4">
        <div className="relative h-40 w-full mb-3 rounded-t-md overflow-hidden group">
          {isLoadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-card">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoadingImage && (
            <Image 
              src={recipe.imageDataUri || `https://placehold.co/600x300.png?text=${encodeURIComponent(recipe.recipeName)}`} 
              alt={recipe.recipeName} 
              layout="fill" 
              objectFit="cover"
              data-ai-hint={!recipe.imageDataUri ? "food meal" : undefined}
              className="transition-all duration-300 group-hover:scale-105"
              priority={false} // Dynamically loaded images are not priority
            />
          )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
           <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
              {mealTitle}
            </div>
        </div>
        <CardTitle className="font-headline text-lg leading-tight">{recipe.recipeName}</CardTitle>
        <CardDescription className="flex items-center text-xs text-muted-foreground">
          <CalendarDays size={14} className="mr-1.5" /> Día {dayNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="text-sm line-clamp-3 italic text-muted-foreground/90">{recipe.evocativeDescription}</p>
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t">
        <Button onClick={onViewDetails} variant="outline" className="w-full" size="sm">
          <UtensilsCrossed size={16} className="mr-2" />
          Ver Receta Completa
        </Button>
      </CardFooter>
    </Card>
  );
}
