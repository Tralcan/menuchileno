
import type { RecipeForModal } from '@/app/page'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UtensilsCrossed, ListChecks, Info, CalendarClock, Sparkles, Users, CookingPot, Youtube } from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: RecipeForModal | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeDetailModal({ recipe, isOpen, onClose }: RecipeDetailModalProps) {
  if (!recipe) return null;

  const thermomixSearchUrl = `https://www.google.cl/search?q=${encodeURIComponent(recipe.recipeName)}+thermomix`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.recipeName)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] grid grid-rows-[auto_1fr_auto] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0 row-start-1">
          <div className="relative h-64 w-full mb-4 rounded-t-md overflow-hidden">
            <Image
              src={recipe.imageDataUri || `https://placehold.co/800x400.png?text=${encodeURIComponent(recipe.recipeName)}`}
              alt={recipe.recipeName}
              layout="fill"
              objectFit="cover"
              data-ai-hint={!recipe.imageDataUri ? "chilean food plate" : undefined}
              priority={false} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <DialogTitle className="font-headline text-3xl absolute bottom-4 left-4 text-primary-foreground">{recipe.recipeName}</DialogTitle>
          </div>
          <DialogDescription className="text-center sm:text-left text-base text-muted-foreground flex items-center gap-2 px-6">
            <CalendarClock size={18} className="text-primary"/> Día {recipe.day} - {recipe.mealTitle}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="row-start-2 min-h-0 overflow-hidden"> 
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-headline text-xl mb-2 flex items-center"><Sparkles size={20} className="mr-2 text-primary"/>Descripción Evocadora:</h3>
              <p className="text-sm italic text-muted-foreground bg-secondary/30 p-4 rounded-md">
                {recipe.evocativeDescription}
              </p>
            </div>

            <div>
              <h3 className="font-headline text-xl mb-2 flex items-center"><ListChecks size={20} className="mr-2 text-primary"/>Ingredientes:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm bg-secondary/30 p-4 rounded-md columns-1 md:columns-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-headline text-xl mb-2 flex items-center"><UtensilsCrossed size={20} className="mr-2 text-primary"/>Instrucciones:</h3>
              <p className="text-sm whitespace-pre-line leading-relaxed bg-secondary/30 p-4 rounded-md">{recipe.instructions}</p>
            </div>
            
            <div>
              <h3 className="font-headline text-xl mb-2 flex items-center"><Info size={20} className="mr-2 text-primary"/>Información Adicional:</h3>
              <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-md flex items-center gap-1.5">
                <Users size={16}/> Esta receta está dimensionada para el número de personas especificado al generar el menú. Los valores nutricionales específicos pueden variar.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t row-start-3 flex flex-col sm:flex-row sm:justify-between items-center gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <a
              href={thermomixSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="secondary" className="w-full">
                <CookingPot size={16} className="mr-2" />
                Buscar receta para Thermomix
              </Button>
            </a>
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="secondary" className="w-full">
                <Youtube size={16} className="mr-2" />
                Buscar video
              </Button>
            </a>
          </div>
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
