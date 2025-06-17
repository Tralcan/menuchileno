"use client";

import { useState } from 'react';
import type { GenerateMenuInput, GenerateMenuOutput } from '@/ai/flows/generate-menu';
import { generateMenu } from '@/ai/flows/generate-menu';
import MenuForm from '@/components/menu/menu-form';
import MenuDisplay from '@/components/menu/menu-display';
import ShoppingListDisplay from '@/components/menu/shopping-list-display';
import RecipeDetailModal from '@/components/menu/recipe-detail-modal';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Image from 'next/image';

type Recipe = Extract<GenerateMenuOutput["menu"][number], { recipeName: string }>;

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<GenerateMenuOutput['menu'] | null>(null);
  const [shoppingList, setShoppingList] = useState<string[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (values: GenerateMenuInput) => {
    setIsLoading(true);
    setError(null);
    setMenuData(null);
    setShoppingList(null);

    try {
      const result = await generateMenu({ numberOfDays: values.numberOfDays });
      if (result && result.menu && result.shoppingList) {
        setMenuData(result.menu);
        setShoppingList(result.shoppingList);
        toast({
          title: "¡Menú Generado!",
          description: `Tu menú para ${values.numberOfDays} días y la lista de compras están listos.`,
          variant: "default",
          duration: 5000,
        });
      } else {
        throw new Error("La respuesta del AI no tiene el formato esperado.");
      }
    } catch (err) {
      console.error("Error generating menu:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido.";
      setError(errorMessage);
      toast({
        title: "Error al generar menú",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-2xl mb-8">
          <Image 
            src="https://placehold.co/1200x400.png"
            alt="Comida chilena variada"
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint="chilean food collage"
            className="animate-pulse-subtle"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl md:text-5xl font-headline text-primary-foreground mb-4 drop-shadow-lg">
              Bienvenido a Menú Chileno
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl drop-shadow-md">
              Genera menús chilenos balanceados y listas de compras al instante. ¡Come rico y fácil!
            </p>
          </div>
        </div>
        <MenuForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      </section>

      {isLoading && (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <LoadingSpinner size={64} />
          <p className="text-xl font-semibold text-primary animate-pulse">Cocinando tu menú...</p>
          <p className="text-muted-foreground">Esto puede tomar unos momentos.</p>
        </div>
      )}

      {error && (
         <Alert variant="destructive" className="max-w-2xl mx-auto">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {menuData && shoppingList && !isLoading && (
        <>
          <MenuDisplay menuData={menuData} onViewRecipe={handleViewRecipe} />
          <ShoppingListDisplay shoppingList={shoppingList} />
        </>
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
