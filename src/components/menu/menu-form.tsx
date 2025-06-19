
"use client";

import * as React from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Users, CalendarDays, Leaf, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";


const formSchema = z.object({
  numberOfDays: z.coerce.number().min(1, "Debe ser al menos 1 día").max(30, "Máximo 30 días"),
  numberOfPeople: z.coerce.number().min(1, "Debe ser al menos 1 persona").max(16, "Máximo 16 personas"),
  dietaryPreference: z.string().optional().default("Todos"),
  glutenFree: z.boolean().optional().default(false),
  lactoseFree: z.boolean().optional().default(false),
});

export type MenuFormValues = z.infer<typeof formSchema>;

interface MenuFormProps {
  onSubmit: (values: MenuFormValues) => void;
  isLoading: boolean;
}

const COOKIE_NAME = 'mySmartMenuFormPrefs';

function getInitialFormValues(): MenuFormValues {
  let defaultValues: MenuFormValues = {
    numberOfDays: 7,
    numberOfPeople: 4,
    dietaryPreference: "Todos",
    glutenFree: false,
    lactoseFree: false,
  };

  if (typeof document !== 'undefined') { // Ensure document is available (client-side)
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1];

    if (cookieValue) {
      try {
        const savedPrefs = JSON.parse(decodeURIComponent(cookieValue));
        defaultValues = {
          numberOfDays: savedPrefs.numberOfDays || 7,
          numberOfPeople: savedPrefs.numberOfPeople || 4,
          dietaryPreference: savedPrefs.dietaryPreference || "Todos",
          glutenFree: typeof savedPrefs.glutenFree === 'boolean' ? savedPrefs.glutenFree : false,
          lactoseFree: typeof savedPrefs.lactoseFree === 'boolean' ? savedPrefs.lactoseFree : false,
        };
      } catch (e) {
        console.error("Error parsing saved form preferences from cookie:", e);
      }
    }
  }
  return defaultValues;
}

export default function MenuForm({ onSubmit, isLoading }: MenuFormProps) {
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialFormValues(),
  });

  const handleSubmit = (values: MenuFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-2">
           <ChefHat size={32} />
        </div>
        <CardTitle className="font-headline text-3xl">¡Planifica tus Comidas!</CardTitle>
        <CardDescription>
          Ingresa los detalles para generar opciones de almuerzo y tu lista de compras personalizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="numberOfDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <CalendarDays size={16} /> Número de Días
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 7" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Users size={16} /> Número de Personas
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 4" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryPreference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Preferencia Dietética Principal</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value} 
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                      disabled={isLoading}
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Todos" />
                        </FormControl>
                        <Label className="font-normal flex items-center gap-1.5 cursor-pointer" htmlFor={field.name + "-todos"}> {/* Using ShadCN Label for direct association */}
                          <Globe size={16} /> Todos
                        </Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Vegetariano" />
                        </FormControl>
                        <Label className="font-normal flex items-center gap-1.5 cursor-pointer" htmlFor={field.name + "-vegetariano"}>
                          <Leaf size={16} /> Vegetariano
                        </Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Vegano" />
                        </FormControl>
                        <Label className="font-normal flex items-center gap-1.5 cursor-pointer" htmlFor={field.name + "-vegano"}>
                          <Leaf size={16} /> Vegano
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Selecciona si deseas un menú con restricciones específicas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="space-y-3">
              <FormLabel>Otras Restricciones Dietéticas</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-1">
                <FormField
                  control={form.control}
                  name="glutenFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          id="glutenFree"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="glutenFree" className="font-normal cursor-pointer">
                          Sin Gluten
                        </Label>
                        <FormDescription>
                          Recetas sin trigo, cebada, centeno, etc.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lactoseFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          id="lactoseFree"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="lactoseFree" className="font-normal cursor-pointer">
                          Sin Lactosa
                        </Label>
                        <FormDescription>
                          Recetas sin lactosa o con alternativas.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </FormItem>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? "Generando Opciones..." : "Generar Opciones de Menú"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

