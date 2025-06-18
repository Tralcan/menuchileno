
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Users, CalendarDays } from "lucide-react";

const formSchema = z.object({
  numberOfDays: z.coerce.number().min(1, "Debe ser al menos 1 día").max(30, "Máximo 30 días"),
  numberOfPeople: z.coerce.number().min(1, "Debe ser al menos 1 persona").max(16, "Máximo 16 personas"),
});

type MenuFormValues = z.infer<typeof formSchema>;

interface MenuFormProps {
  onSubmit: (values: MenuFormValues) => void;
  isLoading: boolean;
}

export default function MenuForm({ onSubmit, isLoading }: MenuFormProps) {
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfDays: 7,
      numberOfPeople: 4,
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-2">
           <ChefHat size={32} />
        </div>
        <CardTitle className="font-headline text-3xl">¡Planifica tu Menú!</CardTitle>
        <CardDescription>
          Ingresa los detalles para generar opciones de almuerzo y tu lista de compras personalizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? "Generando Opciones..." : "Generar Opciones de Menú"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
