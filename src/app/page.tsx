
"use client";

import { useState, useEffect } from 'react';
import type { GenerateMenuInput, GenerateMenuOutput, DailyMenu, CoreRecipe } from '@/ai/flows/generate-menu';
import { generateMenu } from '@/ai/flows/generate-menu';
import type { CreateShoppingListInput, CreateShoppingListOutput } from '@/ai/flows/create-shopping-list';
import { createShoppingList } from '@/ai/flows/create-shopping-list';
import { generateRecipeImage, type GenerateRecipeImageInput } from '@/ai/flows/generate-recipe-image-flow';
import type { GenerateNutritionalInfoInput, GenerateNutritionalInfoOutput, RecipeNutritionalInfo, NutritionalRecipeInput } from '@/ai/flows/generate-nutritional-info-flow';
import { generateNutritionalInfo } from '@/ai/flows/generate-nutritional-info-flow';

import MenuForm from '@/components/menu/menu-form';
import MenuDisplay from '@/components/menu/menu-display';
import ShoppingListDisplay from '@/components/menu/shopping-list-display';
import NutritionalInfoDisplay from '@/components/menu/nutritional-info-display';
import RecipeDetailModal from '@/components/menu/recipe-detail-modal';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShoppingCart, ClipboardList } from "lucide-react";
import Image from 'next/image';
import Script from 'next/script';

export type RecipeForModal = CoreRecipe & { day: number; mealTitle: string; imageDataUri?: string };
export type SelectedLunches = Record<number, CoreRecipe | null>;

export default function HomePage() {
  const [isGeneratingMenu, setIsGeneratingMenu] = useState(false);
  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const [isGeneratingNutrition, setIsGeneratingNutrition] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<DailyMenu[] | null>(null);
  const [selectedLunches, setSelectedLunches] = useState<SelectedLunches>({});
  const [shoppingList, setShoppingList] = useState<string[] | null>(null);
  const [nutritionalReport, setNutritionalReport] = useState<RecipeNutritionalInfo[] | null>(null);
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<RecipeForModal | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({}); // Key: recipeName_day_mealType
  const { toast } = useToast();

  const handleMenuFormSubmit = async (values: GenerateMenuInput) => {
    setIsGeneratingMenu(true);
    setError(null);
    setMenuData(null);
    setSelectedLunches({});
    setShoppingList(null);
    setNutritionalReport(null);
    setLoadingImages({});

    try {
      const result = await generateMenu({ numberOfDays: values.numberOfDays });
      if (result && result.menu) {
        setMenuData(result.menu);
        const initialSelections: SelectedLunches = {};
        result.menu.forEach(dayMenu => {
          initialSelections[dayMenu.day] = dayMenu.suggestedLunch;
        });
        setSelectedLunches(initialSelections);
        toast({
          title: "¡Opciones de Menú Generadas!",
          description: `Tu menú para ${values.numberOfDays} días está listo. Las imágenes de los platos se cargarán en breve.`,
          variant: "default",
          duration: 7000,
        });

        result.menu.forEach(dayMenu => {
          const processRecipeImage = async (recipe: CoreRecipe, day: number, mealType: 'suggested' | 'optional') => {
            const recipeKey = `${recipe.recipeName}_${day}_${mealType}`;
            setLoadingImages(prev => ({ ...prev, [recipeKey]: true }));
            try {
              const imageResult = await generateRecipeImage({
                recipeName: recipe.recipeName,
                evocativeDescription: recipe.evocativeDescription,
              });
              if (imageResult && imageResult.imageDataUri) {
                setMenuData(currentMenuData => {
                  if (!currentMenuData) return null;
                  return currentMenuData.map(dm => {
                    if (dm.day === day) {
                      let newSuggested = dm.suggestedLunch;
                      let newOptional = dm.optionalLunch;
                      if (mealType === 'suggested' && dm.suggestedLunch.recipeName === recipe.recipeName) {
                        newSuggested = { ...dm.suggestedLunch, imageDataUri: imageResult.imageDataUri };
                      } else if (mealType === 'optional' && dm.optionalLunch.recipeName === recipe.recipeName) {
                        newOptional = { ...dm.optionalLunch, imageDataUri: imageResult.imageDataUri };
                      }
                      return { ...dm, suggestedLunch: newSuggested, optionalLunch: newOptional };
                    }
                    return dm;
                  });
                });
                setSelectedLunches(currentSelectedLunches => {
                    const daySelection = currentSelectedLunches[day];
                    if (daySelection && daySelection.recipeName === recipe.recipeName) {
                        return {
                            ...currentSelectedLunches,
                            [day]: { ...daySelection, imageDataUri: imageResult.imageDataUri }
                        };
                    }
                    return currentSelectedLunches;
                });
              }
            } catch (imgErr) {
              console.error(`Error generating image for ${recipe.recipeName} (${mealType}, day ${day}):`, imgErr);
              toast({
                title: "Error al generar imagen",
                description: `No se pudo generar la imagen para ${recipe.recipeName}. Se usará una imagen de reemplazo.`,
                variant: "destructive",
                duration: 4000,
              });
            } finally {
              setLoadingImages(prev => ({ ...prev, [recipeKey]: false }));
            }
          };

          processRecipeImage(dayMenu.suggestedLunch, dayMenu.day, 'suggested');
          processRecipeImage(dayMenu.optionalLunch, dayMenu.day, 'optional');
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
    setShoppingList(null); // Clear shopping list if selection changes
    setNutritionalReport(null); // Clear nutritional report if selection changes
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
    setNutritionalReport(null);


    const shoppingListInputItems: CreateShoppingListInput['menu'] = Object.values(selectedLunches)
      .filter((recipe): recipe is CoreRecipe => recipe !== null) 
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
      setError(errorMessage); 
      toast({
        title: "Error al Generar Lista de Compras",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingList(false);
    }
  };

  const handleGenerateNutritionalInfo = async () => {
    if (!menuData || Object.values(selectedLunches).some(lunch => lunch === null) && Object.keys(selectedLunches).length !== menuData.length ) {
         const unselectedDays = menuData.filter(dayMenu => !selectedLunches[dayMenu.day]).length;
         if (unselectedDays > 0) {
            toast({
                title: "Selección Incompleta",
                description: `Por favor, selecciona un almuerzo para cada día del menú antes de generar la información nutricional. Faltan ${unselectedDays} día(s).`,
                variant: "destructive",
            });
            return;
         }
    }
    
    const nutritionalInputItems: NutritionalRecipeInput[] = Object.values(selectedLunches)
      .filter((recipe): recipe is CoreRecipe => recipe !== null)
      .map(recipe => ({
        recipeName: recipe.recipeName,
        ingredients: recipe.ingredients,
      }));

    if (nutritionalInputItems.length === 0) {
      toast({
        title: "No hay selecciones",
        description: "No has seleccionado ningún almuerzo para generar la información nutricional.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingNutrition(true);
    setError(null);
    setNutritionalReport(null);
    setShoppingList(null);

    try {
      const result = await generateNutritionalInfo({ selectedRecipes: nutritionalInputItems });
      if (result && result.nutritionalReport) {
        setNutritionalReport(result.nutritionalReport);
        toast({
          title: "¡Información Nutricional Generada!",
          description: "El análisis nutricional para tus selecciones está listo.",
          variant: "default",
          duration: 5000,
        });
      } else {
        throw new Error("La respuesta de la IA para la información nutricional no tiene el formato esperado.");
      }
    } catch (err) {
      console.error("Error generating nutritional information:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido al generar la información nutricional.";
      setError(errorMessage);
      toast({
        title: "Error al Generar Información Nutricional",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNutrition(false);
    }
  };


  const handleViewRecipe = (recipe: CoreRecipe, day: number, mealTitle: string) => {
    const currentDayMenu = menuData?.find(dm => dm.day === day);
    let recipeWithLatestImage = recipe;
    if (currentDayMenu) {
        if (currentDayMenu.suggestedLunch.recipeName === recipe.recipeName) {
            recipeWithLatestImage = currentDayMenu.suggestedLunch;
        } else if (currentDayMenu.optionalLunch.recipeName === recipe.recipeName) {
            recipeWithLatestImage = currentDayMenu.optionalLunch;
        }
    }
    setSelectedRecipeForModal({ ...recipeWithLatestImage, day, mealTitle });
  };
  

  const handleCloseModal = () => {
    setSelectedRecipeForModal(null);
  };
  
  const canGenerateAdditionalInfo = menuData && Object.values(selectedLunches).some(lunch => lunch !== null);


  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-2xl mb-8">
          <Image 
            src="https://placehold.co/1200x400.png"
            alt="Variedad de platos de almuerzo chilenos y latinos"
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint="latin american food lunch"
            className="animate-pulse-subtle"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl md:text-5xl font-headline text-primary-foreground mb-4 drop-shadow-lg">
              Bienvenido a MySmart Menu
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl drop-shadow-md">
              Genera opciones de almuerzos variados. Crea tu lista de compras y revisa la información nutricional. ¡Cocina inteligente, come delicioso!
            </p>
          </div>
        </div>
        <MenuForm onSubmit={handleMenuFormSubmit} isLoading={isGeneratingMenu} />
      </section>

      {(isGeneratingMenu || isGeneratingList || isGeneratingNutrition) && (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <LoadingSpinner size={64} />
          <p className="text-xl font-semibold text-primary animate-pulse">
            {isGeneratingMenu && "Cocinando tus opciones de menú..."}
            {isGeneratingList && "Creando tu lista de compras..."}
            {isGeneratingNutrition && "Analizando la información nutricional..."}
          </p>
          <p className="text-muted-foreground">Esto puede tomar unos momentos.</p>
        </div>
      )}

      {error && !isGeneratingMenu && !isGeneratingList && !isGeneratingNutrition && (
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
            loadingImages={loadingImages}
          />
          {canGenerateAdditionalInfo && (
            <div className="text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button 
                onClick={handleGenerateShoppingList} 
                disabled={isGeneratingList || isGeneratingMenu || isGeneratingNutrition}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isGeneratingList ? "Generando Lista..." : "Generar Lista de Compras"}
              </Button>
              <Button 
                onClick={handleGenerateNutritionalInfo} 
                disabled={isGeneratingNutrition || isGeneratingMenu || isGeneratingList}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <ClipboardList className="mr-2 h-5 w-5" />
                {isGeneratingNutrition ? "Analizando Nutrición..." : "Información Nutricional"}
              </Button>
            </div>
          )}
          {canGenerateAdditionalInfo && (
            <div className="text-center mt-8">
              <Script
                src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
                data-name="bmc-button"
                data-slug="6hxrhhkvhs2"
                data-color="#FFDD00"
                data-emoji=""
                data-font="Cookie"
                data-text="Buy me a coffee"
                data-outline-color="#000000"
                data-font-color="#000000"
                data-coffee-color="#ffffff"
                strategy="afterInteractive" 
              />
            </div>
          )}
        </>
      )}
      
      {shoppingList && !isGeneratingList && !isGeneratingNutrition && (
          <ShoppingListDisplay shoppingList={shoppingList} />
      )}

      {nutritionalReport && !isGeneratingNutrition && !isGeneratingList && (
          <NutritionalInfoDisplay nutritionalReport={nutritionalReport} />
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
