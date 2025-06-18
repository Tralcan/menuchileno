
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Users, CalendarDays, Leaf, Globe } from "lucide-react";

const formSchema = z.object({
  numberOfDays: z.coerce.number().min(1, "Debe ser al menos 1 día").max(30, "Máximo 30 días"),
  numberOfPeople: z.coerce.number().min(1, "Debe ser al menos 1 persona").max(16, "Máximo 16 personas"),
  dietaryPreference: z.string().optional().default("Todos"),
});

type MenuFormValues = z.infer<typeof formSchema>;

interface MenuFormProps {
  onSubmit: (values: Omit<MenuFormValues, 'dietaryPreference'> & { dietaryPreference?: string }) => void;
  isLoading: boolean;
}

export default function MenuForm({ onSubmit, isLoading }: MenuFormProps) {
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfDays: 7,
      numberOfPeople: 4,
      dietaryPreference: "Todos",
    },
  });

  const handleSubmit = (values: MenuFormValues) => {
    const submissionValues = {
      ...values,
      dietaryPreference: values.dietaryPreference === "Todos" ? undefined : values.dietaryPreference,
    };
    onSubmit(submissionValues);
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
                  <FormLabel>Preferencia Dietética</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                      disabled={isLoading}
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Todos" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-1.5">
                          <Globe size={16} /> Todos
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Vegetariano" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-1.5">
                          <Leaf size={16} /> Vegetariano
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Vegano" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-1.5">
                          <Leaf size={16} /> Vegano
                        </FormLabel>
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
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? "Generando Opciones..." : "Generar Opciones de Menú"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
