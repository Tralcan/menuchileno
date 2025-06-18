// src/components/menu/shopping-list-display.tsx
import * as React from 'react';
import { sendShoppingListEmail, type SendShoppingListEmailInput } from '@/ai/flows/send-shopping-list-email-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, ShoppingCart, Mail, Send, Loader2 } from "lucide-react";

interface ShoppingListDisplayProps {
  shoppingList: string[];
}

export default function ShoppingListDisplay({ shoppingList }: ShoppingListDisplayProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = React.useState(false);
  const [recipientEmail, setRecipientEmail] = React.useState('');
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast({
        title: "Correo Requerido",
        description: "Por favor, ingresa una dirección de correo electrónico.",
        variant: "destructive",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
        toast({
            title: "Correo Inválido",
            description: "Por favor, ingresa una dirección de correo electrónico válida.",
            variant: "destructive",
        });
        return;
    }

    setIsSendingEmail(true);
    try {
      const result = await sendShoppingListEmail({
        recipientEmail,
        shoppingList,
      });

      if (result.success) {
        toast({
          title: "¡Correo Enviado!",
          description: result.message,
          variant: "default",
        });
        setIsEmailDialogOpen(false);
        setRecipientEmail('');
      } else {
        toast({
          title: "Error al Enviar Correo",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Inesperado",
        description: error.message || "Ocurrió un error al intentar enviar el correo.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };


  return (
    <section className="mt-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-2">
            <ShoppingCart size={32} />
          </div>
          <CardTitle className="font-headline text-3xl">Tu Lista de Compras</CardTitle>
          <CardDescription>Estos son los ingredientes que necesitarás para los almuerzos seleccionados.</CardDescription>
        </CardHeader>
        <CardContent>
          {shoppingList.length > 0 ? (
            <ScrollArea className="h-96 w-full rounded-md border p-4 bg-secondary/30">
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
            <p className="text-center text-muted-foreground py-8">Tu lista de compras aparecerá aquí una vez que selecciones tus almuerzos y generes la lista.</p>
          )}
        </CardContent>
        {shoppingList.length > 0 && (
            <CardFooter className="flex justify-center py-6">
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Mail className="mr-2 h-5 w-5" />
                  Enviar Lista por Correo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Enviar Lista de Compras</DialogTitle>
                  <DialogDescription>
                    Ingresa la dirección de correo electrónico a la que deseas enviar la lista.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shopping-list-email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="shopping-list-email"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="nombre@ejemplo.com"
                      className="col-span-3"
                      disabled={isSendingEmail}
                    />
                  </div>
                </div>
                <DialogFooter>
                   <DialogClose asChild>
                      <Button type="button" variant="outline" disabled={isSendingEmail}>
                        Cancelar
                      </Button>
                    </DialogClose>
                  <Button onClick={handleSendEmail} disabled={isSendingEmail}>
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                       <Send className="mr-2 h-4 w-4" />
                        Enviar
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        )}
      </Card>
    </section>
  );
}
