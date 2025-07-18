
"use client";

import React, { useState, useEffect } from 'react'; // Explicit React import
import type { GenerateMenuInput, GenerateMenuOutput, DailyMenu, CoreRecipe } from '@/ai/flows/generate-menu';
import { generateMenu } from '@/ai/flows/generate-menu';
import type { CreateShoppingListInput, CreateShoppingListOutput } from '@/ai/flows/create-shopping-list';
import { createShoppingList } from '@/ai/flows/create-shopping-list';
import { generateRecipeImage, type GenerateRecipeImageInput } from '@/ai/flows/generate-recipe-image-flow';
import type { GenerateNutritionalInfoInput, GenerateNutritionalInfoOutput, RecipeNutritionalInfo, NutritionalRecipeInput } from '@/ai/flows/generate-nutritional-info-flow';
import { generateNutritionalInfo } from '@/ai/flows/generate-nutritional-info-flow';
import { sendSelectedMenuEmail, type SendSelectedMenuEmailInput, type SelectedMenuItem } from '@/ai/flows/send-selected-menu-email-flow';


import MenuForm, { type MenuFormValues } from '@/components/menu/menu-form'; // Import MenuFormValues
import MenuDisplay from '@/components/menu/menu-display';
import ShoppingListDisplay from '@/components/menu/shopping-list-display';
import NutritionalInfoDisplay from '@/components/menu/nutritional-info-display';
import RecipeDetailModal from '@/components/menu/recipe-detail-modal';
import CoffeeModal from '@/components/menu/coffee-modal';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShoppingCart, ClipboardList, Heart, Mail, Send, Loader2 } from "lucide-react";
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export type RecipeForModal = CoreRecipe & { day: number; mealTitle: string; imageDataUri?: string };
export type SelectedRecipes = Record<string, { recipe: CoreRecipe, day: number }>;

// Use MenuFormValues for values received from MenuForm
type MenuFormSubmitValues = MenuFormValues;
const COOKIE_NAME = 'mySmartMenuFormPrefs';

export default function HomePage() {
  const [isGeneratingMenu, setIsGeneratingMenu] = useState(false);
  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const [isGeneratingNutrition, setIsGeneratingNutrition] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<DailyMenu[] | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedRecipes>({});
  const [shoppingList, setShoppingList] = useState<string[] | null>(null);
  const [nutritionalReport, setNutritionalReport] = useState<RecipeNutritionalInfo[] | null>(null);
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<RecipeForModal | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({}); 
  const [heroImageDataUri, setHeroImageDataUri] = useState<string | null>(null);
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  const [currentNumberOfPeople, setCurrentNumberOfPeople] = useState<number>(4);
  
  const [isSendMenuEmailDialogOpen, setIsSendMenuEmailDialogOpen] = React.useState(false);
  const [menuRecipientEmail, setMenuRecipientEmail] = React.useState('');
  const [isSendingMenuEmail, setIsSendingMenuEmail] = React.useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const generateHeroImage = async () => {
      try {
        const imageResult = await generateRecipeImage({
          recipeName: "Hero Image Chilean Cuisine",
          evocativeDescription: "A vibrant and appetizing array of diverse Chilean and Latin American lunch dishes, beautifully plated. Bright, food photography style, suitable for a cooking app banner.",
        });
        if (imageResult && imageResult.imageDataUri) {
          setHeroImageDataUri(imageResult.imageDataUri);
        }
      } catch (err) {
        console.error("Error generating hero image:", err);
      }
    };
    generateHeroImage();
  }, []); 

  const handleMenuFormSubmit = async (values: MenuFormSubmitValues) => {
    setIsGeneratingMenu(true);
    setError(null);
    setMenuData(null);
    setSelectedRecipes({});
    setShoppingList(null);
    setNutritionalReport(null);
    setLoadingImages({});
    setCurrentNumberOfPeople(values.numberOfPeople || 4);

    const aiDietaryPreference = values.dietaryPreference === "Todos" ? undefined : values.dietaryPreference;

    try {
      const menuInput: GenerateMenuInput = { 
        numberOfDays: values.numberOfDays, 
        numberOfPeople: values.numberOfPeople || 4,
        dietaryPreference: aiDietaryPreference,
        glutenFree: values.glutenFree,
        lactoseFree: values.lactoseFree,
      };
      const result = await generateMenu(menuInput);

      if (result && result.menu) {
        setMenuData(result.menu);
        const initialSelections: SelectedRecipes = {};
        result.menu.forEach(dayMenu => {
          const recipeKey = `day-${dayMenu.day}-suggested`;
          initialSelections[recipeKey] = { recipe: dayMenu.suggestedLunch, day: dayMenu.day };
        });
        setSelectedRecipes(initialSelections);
        
        // Save form preferences to cookie after successful generation
        const prefsToSave: MenuFormSubmitValues = {
            numberOfDays: values.numberOfDays,
            numberOfPeople: values.numberOfPeople,
            dietaryPreference: values.dietaryPreference, // Save the raw "Todos", "Vegetariano", or "Vegano"
            glutenFree: values.glutenFree || false,
            lactoseFree: values.lactoseFree || false,
        };
        document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(prefsToSave))};path=/;max-age=${60*60*24*30};SameSite=Lax`;


        let toastDescription = `Tu menú para ${values.numberOfDays} días, ${values.numberOfPeople || 4} personas`;
        if (values.dietaryPreference && values.dietaryPreference !== "Todos") {
          toastDescription += ` (${values.dietaryPreference})`;
        }
        if (values.glutenFree) {
          toastDescription += `, Sin Gluten`;
        }
        if (values.lactoseFree) {
          toastDescription += `, Sin Lactosa`;
        }
        toastDescription += ` está listo. Las imágenes se cargarán.`;
        
        toast({
          title: "¡Opciones de Menú Generadas!",
          description: toastDescription,
          variant: "default",
          duration: 7000,
        });

        result.menu.forEach(dayMenu => {
          const processRecipeImage = async (recipe: CoreRecipe, day: number, mealType: 'suggested' | 'optional') => {
            const recipeImageKey = `${recipe.recipeName}_${day}_${mealType}`;
            setLoadingImages(prev => ({ ...prev, [recipeImageKey]: true }));
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
                setSelectedRecipes(currentSelectedRecipes => {
                    const recipeStateKey = `day-${day}-${mealType}`;
                    if (currentSelectedRecipes[recipeStateKey]) {
                        return {
                            ...currentSelectedRecipes,
                            [recipeStateKey]: {
                                ...currentSelectedRecipes[recipeStateKey],
                                recipe: {
                                    ...currentSelectedRecipes[recipeStateKey].recipe,
                                    imageDataUri: imageResult.imageDataUri,
                                }
                            }
                        };
                    }
                    return currentSelectedRecipes;
                });
              }
            } catch (imgErr) {
              console.error(`Error generating image for ${recipe.recipeName} (${mealType}, day ${day}):`, imgErr);
              // Toast for image error removed as per user request
            } finally {
              setLoadingImages(prev => ({ ...prev, [recipeImageKey]: false }));
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

  const handleRecipeSelection = (recipe: CoreRecipe, day: number, mealType: 'suggested' | 'optional', isSelected: boolean) => {
    const recipeKey = `day-${day}-${mealType}`;
    setSelectedRecipes(prev => {
        const newSelections = { ...prev };
        if (isSelected) {
            newSelections[recipeKey] = { recipe, day };
        } else {
            delete newSelections[recipeKey];
        }
        return newSelections;
    });
    setShoppingList(null);
    setNutritionalReport(null);
  };

  const handleGenerateShoppingList = async () => {
    if (Object.keys(selectedRecipes).length === 0) {
      toast({
        title: "Selección Vacía",
        description: "Por favor, selecciona al menos un almuerzo antes de generar la lista.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingList(true);
    setError(null);
    setShoppingList(null);


    const shoppingListInputItems: CreateShoppingListInput['menu'] = Object.values(selectedRecipes)
      .map(({ recipe }) => ({
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
     if (Object.keys(selectedRecipes).length === 0) {
      toast({
          title: "Selección Vacía",
          description: `Por favor, selecciona al menos un almuerzo para generar la información nutricional.`,
          variant: "destructive",
      });
      return;
    }
    
    const nutritionalInputItems: NutritionalRecipeInput[] = Object.values(selectedRecipes)
      .map(({ recipe }) => ({
        recipeName: recipe.recipeName,
        ingredients: recipe.ingredients,
        numberOfOriginalServings: currentNumberOfPeople,
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

    try {
      const result = await generateNutritionalInfo({ 
        selectedRecipes: nutritionalInputItems,
      });
      if (result && result.nutritionalReport) {
        setNutritionalReport(result.nutritionalReport);
        toast({
          title: "¡Información Nutricional Generada!",
          description: "El análisis nutricional por persona para tus selecciones está listo.",
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

  const handleSendSelectedMenuByEmail = async () => {
    if (!menuRecipientEmail) {
      toast({ title: "Correo Requerido", description: "Por favor, ingresa una dirección de correo electrónico.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(menuRecipientEmail)) {
      toast({ title: "Correo Inválido", description: "Por favor, ingresa una dirección de correo electrónico válida.", variant: "destructive" });
      return;
    }

    const menuToEmail: SelectedMenuItem[] = Object.values(selectedRecipes)
      .map(({ recipe, day }) => {
        return {
          day,
          recipeName: recipe.recipeName,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          evocativeDescription: recipe.evocativeDescription,
          suggestedMusic: recipe.suggestedMusic,
          suggestedPairing: recipe.suggestedPairing,
        };
      })
      .sort((a, b) => a.day - b.day);

    if (menuToEmail.length === 0) {
      toast({ title: "Menú Vacío", description: "No hay almuerzos seleccionados para enviar.", variant: "default" });
      return;
    }

    setIsSendingMenuEmail(true);
    try {
      const result = await sendSelectedMenuEmail({ recipientEmail: menuRecipientEmail, selectedMenu: menuToEmail });
      if (result.success) {
        toast({ title: "¡Correo Enviado!", description: result.message, variant: "default" });
        setIsSendMenuEmailDialogOpen(false);
        setMenuRecipientEmail('');
      } else {
        toast({ title: "Error al Enviar Correo", description: result.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error Inesperado", description: error.message || "Ocurrió un error al enviar el correo del menú.", variant: "destructive" });
    } finally {
      setIsSendingMenuEmail(false);
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

  const handleOpenCoffeeModal = () => {
    setIsCoffeeModalOpen(true);
  };

  const handleCloseCoffeeModal = () => {
    setIsCoffeeModalOpen(false);
  };
  
  const canGenerateAdditionalInfo = menuData && Object.keys(selectedRecipes).length > 0;

  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-2xl mb-8">
          <Image 
            src={heroImageDataUri || "https://placehold.co/1200x400.png"}
            alt="Variedad de platos de almuerzo chilenos y latinos"
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint={heroImageDataUri ? undefined : "latin american food lunch"}
            className={!heroImageDataUri ? "animate-pulse-subtle" : ""}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl md:text-5xl font-headline text-primary-foreground mb-4 drop-shadow-lg">
              Bienvenido a My Smart Menu
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl drop-shadow-md">
              Genera opciones de almuerzos variados. Crea tu lista de compras y revisa la información nutricional. ¡Cocina inteligente, come delicioso!
            </p>
          </div>
        </div>
        <MenuForm onSubmit={handleMenuFormSubmit} isLoading={isGeneratingMenu} />
      </section>

      {(isGeneratingMenu || isGeneratingList || isGeneratingNutrition || isSendingMenuEmail) && (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <LoadingSpinner size={64} />
          <p className="text-xl font-semibold text-primary animate-pulse">
            {isGeneratingMenu && "Cocinando tus opciones de menú..."}
            {isGeneratingList && "Creando tu lista de compras..."}
            {isGeneratingNutrition && "Analizando la información nutricional..."}
            {isSendingMenuEmail && "Enviando tu menú por correo..."}
          </p>
          <p className="text-muted-foreground">Esto puede tomar unos momentos.</p>
        </div>
      )}

      {error && !isGeneratingMenu && !isGeneratingList && !isGeneratingNutrition && !isSendingMenuEmail && (
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
            selectedRecipes={selectedRecipes}
            onRecipeSelect={handleRecipeSelection}
            onViewRecipe={handleViewRecipe}
            loadingImages={loadingImages}
          />
          {canGenerateAdditionalInfo && (
            <div className="text-center mt-8 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
              <Dialog open={isSendMenuEmailDialogOpen} onOpenChange={setIsSendMenuEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isGeneratingMenu || isGeneratingList || isGeneratingNutrition || isSendingMenuEmail}
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Enviar Menú por Mail
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Enviar Menú Seleccionado</DialogTitle>
                    <DialogDescription>
                      Ingresa la dirección de correo electrónico a la que deseas enviar el menú.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="menu-email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="menu-email"
                        type="email"
                        value={menuRecipientEmail}
                        onChange={(e) => setMenuRecipientEmail(e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        className="col-span-3"
                        disabled={isSendingMenuEmail}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" disabled={isSendingMenuEmail}>
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button onClick={handleSendSelectedMenuByEmail} disabled={isSendingMenuEmail}>
                      {isSendingMenuEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Menú
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={handleGenerateShoppingList} 
                disabled={isGeneratingList || isGeneratingMenu || isGeneratingNutrition || isSendingMenuEmail}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isGeneratingList ? "Generando Lista..." : "Generar Lista de Compras"}
              </Button>
              <Button 
                onClick={handleGenerateNutritionalInfo} 
                disabled={isGeneratingNutrition || isGeneratingMenu || isGeneratingList || isSendingMenuEmail}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <ClipboardList className="mr-2 h-5 w-5" />
                {isGeneratingNutrition ? "Analizando Nutrición..." : "Información Nutricional"}
              </Button>
            </div>
          )}
          {canGenerateAdditionalInfo && (
            <div className="text-center mt-6"> 
              <Button 
                onClick={handleOpenCoffeeModal}
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Heart className="mr-2 h-5 w-5" />
                Apóyame con tu aporte
              </Button>
            </div>
          )}
        </>
      )}
      
      {shoppingList && !isGeneratingList && !isGeneratingNutrition && !isSendingMenuEmail && (
          <ShoppingListDisplay shoppingList={shoppingList} />
      )}

      {nutritionalReport && !isGeneratingNutrition && !isGeneratingList && !isSendingMenuEmail && (
          <NutritionalInfoDisplay nutritionalReport={nutritionalReport} />
      )}

      {selectedRecipeForModal && (
        <RecipeDetailModal
          recipe={selectedRecipeForModal}
          isOpen={!!selectedRecipeForModal}
          onClose={handleCloseModal}
        />
      )}
      {isCoffeeModalOpen && (
        <CoffeeModal
          isOpen={isCoffeeModalOpen}
          onClose={handleCloseCoffeeModal}
        />
      )}
    </div>
  );
}
