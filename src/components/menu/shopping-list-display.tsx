import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, ShoppingCart } from "lucide-react";

interface ShoppingListDisplayProps {
  shoppingList: string[];
}

export default function ShoppingListDisplay({ shoppingList }: ShoppingListDisplayProps) {
  return (
    <section className="mt-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-2">
            <ShoppingCart size={32} />
          </div>
          <CardTitle className="font-headline text-3xl">Lista de Compras</CardTitle>
          <CardDescription>Estos son los ingredientes que necesitarás para tu menú.</CardDescription>
        </CardHeader>
        <CardContent>
          {shoppingList.length > 0 ? (
            <ScrollArea className="h-72 w-full rounded-md border p-4 bg-secondary/30 scroll-area-viewport">
              <ul className="space-y-2">
                {shoppingList.map((item, index) => (
                  <li key={index} className="flex items-center text-sm p-2 bg-background rounded-md shadow-sm hover:bg-secondary/20 transition-colors">
                    <CheckSquare size={16} className="mr-3 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-8">Tu lista de compras aparecerá aquí una vez que generes un menú.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
