
"use client";

import { useState, useEffect } from 'react';
import type { GenerateMenuInput, GenerateMenuOutput, DailyMenu, CoreRecipe } from '@/ai/flows/generate-menu';
import { generateMenu } from '@/ai/flows/generate-menu';
import type { CreateShoppingListInput, CreateShoppingListOutput } from '@/ai/flows/create-shopping-list';
import { createShoppingList } from '@/ai/flows/create-shopping-list';
import MenuForm from '@/components/menu/menu-form';
import MenuDisplay from '@/components/menu/menu-display';
import ShoppingListDisplay from '@/components/menu/shopping-list-display';
import RecipeDetailModal from '@/components/menu/recipe-detail-modal';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShoppingCart } from "lucide-react";
import Image from 'next/image';

export type RecipeForModal = CoreRecipe & { day: number; mealTitle: string; };
export type SelectedLunches = Record<number, CoreRecipe | null>;

export default function HomePage() {
  const [isGeneratingMenu, setIsGeneratingMenu] = useState(false);
  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<DailyMenu[] | null>(null);
  const [selectedLunches, setSelectedLunches] = useState<SelectedLunches>({});
  const [shoppingList, setShoppingList] = useState<string[] | null>(null);
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<RecipeForModal | null>(null);
  const { toast } = useToast();

  const handleMenuFormSubmit = async (values: GenerateMenuInput) => {
    setIsGeneratingMenu(true);
    setError(null);
    setMenuData(null);
    setSelectedLunches({});
    setShoppingList(null);

    try {
      const result = await generateMenu({ numberOfDays: values.numberOfDays });
      if (result && result.menu) {
        setMenuData(result.menu);
        // Initialize selectedLunches with suggested one for each day
        const initialSelections: SelectedLunches = {};
        result.menu.forEach(dayMenu => {
          initialSelections[dayMenu.day] = dayMenu.suggestedLunch;
        });
        setSelectedLunches(initialSelections);
        toast({
          title: "¡Opciones de Menú Generadas!",
          description: `Tu menú para ${values.numberOfDays} días con opciones de almuerzo está listo. Selecciona tus preferidos y luego genera la lista de compras.`,
          variant: "default",
          duration: 7000,
        });
      } else {
        throw new Error("La respuesta de la IA para el menú no tiene el formato esperado.");
      }
    } catch (err) {
      console.error("Error generating menu:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido al generar el menú.";
      setError(errorMessage);
      toast({
        title: "Error al Generar Menú",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMenu(false);
    }
  };

  const handleLunchSelection = (day: number, recipe: CoreRecipe) => {
    setSelectedLunches(prev => ({ ...prev, [day]: recipe }));
  };

  const handleGenerateShoppingList = async () => {
    if (!menuData || Object.keys(selectedLunches).length === 0) {
      toast({
        title: "Selección Incompleta",
        description: "Por favor, selecciona al menos un almuerzo antes de generar la lista.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingList(true);
    setError(null);
    setShoppingList(null);

    const shoppingListInputItems: CreateShoppingListInput['menu'] = Object.values(selectedLunches)
      .filter((recipe): recipe is CoreRecipe => recipe !== null) // Type guard and filter out nulls
      .map(recipe => ({
        dishName: recipe.recipeName,
        ingredients: recipe.ingredients,
      }));

    if (shoppingListInputItems.length === 0) {
      toast({
        title: "No hay selecciones",
        description: "No has seleccionado ningún almuerzo para la lista de compras.",
        variant: "default",
      });
      setIsGeneratingList(false);
      return;
    }

    try {
      const result = await createShoppingList({ menu: shoppingListInputItems });
      if (result && result.shoppingList) {
        setShoppingList(result.shoppingList);
        toast({
          title: "¡Lista de Compras Generada!",
          description: "Tu lista de compras basada en tus selecciones está lista.",
          variant: "default",
          duration: 5000,
        });
      } else {
        throw new Error("La respuesta de la IA para la lista de compras no tiene el formato esperado.");
      }
    } catch (err) {
      console.error("Error generating shopping list:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido al generar la lista de compras.";
      setError(errorMessage); // Consider if a separate error state for shopping list is needed
      toast({
        title: "Error al Generar Lista de Compras",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingList(false);
    }
  };

  const handleViewRecipe = (recipe: CoreRecipe, day: number, mealTitle: string) => {
    setSelectedRecipeForModal({ ...recipe, day, mealTitle });
  };

  const handleCloseModal = () => {
    setSelectedRecipeForModal(null);
  };
  
  const canGenerateShoppingList = menuData && Object.values(selectedLunches).some(lunch => lunch !== null);


  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-2xl mb-8">
          <Image 
            src="https://placehold.co/1200x400.png"
            alt="Variedad de platos de almuerzo chilenos"
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint="chilean lunch food"
            className="animate-pulse-subtle"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl md:text-5xl font-headline text-primary-foreground mb-4 drop-shadow-lg">
              Bienvenido a Mi Smart Menú
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl drop-shadow-md">
              Genera opciones de almuerzos chilenos y crea tu lista de compras personalizada. ¡Cocina inteligente, come delicioso!
            </p>
          </div>
        </div>
        <MenuForm onSubmit={handleMenuFormSubmit} isLoading={isGeneratingMenu} />
      </section>

      {(isGeneratingMenu || isGeneratingList) && (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <LoadingSpinner size={64} />
          <p className="text-xl font-semibold text-primary animate-pulse">
            {isGeneratingMenu ? "Cocinando tus opciones de menú..." : "Creando tu lista de compras..."}
          </p>
          <p className="text-muted-foreground">Esto puede tomar unos momentos.</p>
        </div>
      )}

      {error && !isGeneratingMenu && !isGeneratingList && (
         <Alert variant="destructive" className="max-w-2xl mx-auto">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {menuData && !isGeneratingMenu && (
        <>
          <MenuDisplay 
            menuData={menuData} 
            selectedLunches={selectedLunches}
            onLunchSelect={handleLunchSelection}
            onViewRecipe={handleViewRecipe} 
          />
          {canGenerateShoppingList && (
            <div className="text-center mt-8">
              <Button 
                onClick={handleGenerateShoppingList} 
                disabled={isGeneratingList || isGeneratingMenu}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isGeneratingList ? "Generando Lista..." : "Generar Lista de Compras"}
              </Button>
            </div>
          )}
        </>
      )}
      
      {shoppingList && !isGeneratingList && (
          <ShoppingListDisplay shoppingList={shoppingList} />
      )}

      {selectedRecipeForModal && (
        <RecipeDetailModal
          recipe={selectedRecipeForModal}
          isOpen={!!selectedRecipeForModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
