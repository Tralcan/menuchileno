import type { GenerateMenuOutput } from '@/ai/flows/generate-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UtensilsCrossed, ListChecks, Info } from 'lucide-react';

type Recipe = Extract<GenerateMenuOutput["menu"][number], { recipeName: string }>;

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeDetailModal({ recipe, isOpen, onClose }: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="relative h-64 w-full mb-4 rounded-t-md overflow-hidden">
            <Image 
              src={`https://placehold.co/800x400.png?${encodeURIComponent(recipe.recipeName)}`}
              alt={recipe.recipeName}
              layout="fill"
              objectFit="cover"
              data-ai-hint="chilean food"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
             <DialogTitle className="font-headline text-3xl absolute bottom-4 left-4 text-primary-foreground">{recipe.recipeName}</DialogTitle>
          </div>
          <DialogDescription className="text-center sm:text-left">
            Día {recipe.day} - {recipe.meal}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow px-6 scroll-area-viewport">
          <div className="space-y-6 py-4">
            <div>
              <h3 className="font-headline text-xl mb-2 flex items-center"><ListChecks size={20} className="mr-2 text-primary"/>Ingredientes:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm bg-secondary/30 p-4 rounded-md">
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
              <h3 className="font-headline text-xl mb-2 flex items-center"><Info size={20} className="mr-2 text-primary"/>Información Nutricional (Ejemplo):</h3>
              <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-md">
                Esta receta está pensada para 4 personas y forma parte de un menú balanceado. 
                Los valores nutricionales específicos pueden variar según los ingredientes exactos y las porciones.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-0 border-t">
          <Button onClick={onClose} variant="outline">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
