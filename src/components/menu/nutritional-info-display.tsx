
// src/components/menu/nutritional-info-display.tsx
import * as React from 'react';
import type { RecipeNutritionalInfo } from '@/ai/flows/generate-nutritional-info-flow';
import { sendNutritionalReportEmail, type SendNutritionalReportEmailInput } from '@/ai/flows/send-nutritional-report-email-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Activity, Percent, Flame, Wheat, Drumstick, Leaf, Info, PieChartIcon, Mail, Send, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NutritionalInfoDisplayProps {
  nutritionalReport: RecipeNutritionalInfo[];
}

const MACRO_COLORS = {
  protein: 'hsl(var(--chart-1))',
  carbohydrates: 'hsl(var(--chart-2))',
  fats: 'hsl(var(--chart-3))',
};

export default function NutritionalInfoDisplay({ nutritionalReport }: NutritionalInfoDisplayProps) {
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
    // Basic email validation
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
      const result = await sendNutritionalReportEmail({
        recipientEmail,
        nutritionalReport,
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

  if (!nutritionalReport || nutritionalReport.length === 0) {
    return (
      <Card className="mt-12 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-2">
            <Activity size={32} />
          </div>
          <CardTitle className="font-headline text-3xl">Información Nutricional</CardTitle>
          <CardDescription>No hay información nutricional para mostrar.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="mt-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-2">
            <Activity size={32} />
          </div>
          <CardTitle className="font-headline text-3xl">Análisis Nutricional Detallado</CardTitle>
          <CardDescription className="flex items-center justify-center gap-1.5">
            Información nutricional estimada por persona para los almuerzos seleccionados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={nutritionalReport.map(report => report.recipeName)} className="w-full space-y-4">
            {nutritionalReport.map((report) => {
              const macroData = [
                { name: 'Proteínas', value: report.nutritionalInfo.proteinPercentage || 0, color: MACRO_COLORS.protein },
                { name: 'Carbohidratos', value: report.nutritionalInfo.carbohydratesPercentage || 0, color: MACRO_COLORS.carbohydrates },
                { name: 'Grasas', value: report.nutritionalInfo.fatsPercentage || 0, color: MACRO_COLORS.fats },
              ].filter(macro => typeof macro.value === 'number' && macro.value > 0);

              const hasMacroData = macroData.length > 0 && macroData.some(m => m.value > 0);

              return (
              <AccordionItem value={report.recipeName} key={report.recipeName} className="bg-card rounded-lg shadow-md overflow-hidden border-none">
                <AccordionTrigger className="px-6 py-4 text-xl font-headline hover:bg-secondary/50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="text-primary" /> {report.recipeName}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Valores Nutricionales (por persona):</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-secondary/30 p-3 rounded-md">
                        <h5 className="font-semibold mb-1 flex items-center"><Flame size={16} className="mr-1.5 text-accent"/>Calorías:</h5>
                        <p>{report.nutritionalInfo.calories}</p>
                      </div>
                      <div className="bg-secondary/30 p-3 rounded-md">
                        <h5 className="font-semibold mb-1 flex items-center"><Drumstick size={16} className="mr-1.5 text-accent"/>Proteínas:</h5>
                        <p>{report.nutritionalInfo.protein}</p>
                      </div>
                      <div className="bg-secondary/30 p-3 rounded-md">
                        <h5 className="font-semibold mb-1 flex items-center"><Wheat size={16} className="mr-1.5 text-accent"/>Carbohidratos:</h5>
                        <p>{report.nutritionalInfo.carbohydrates}</p>
                      </div>
                      <div className="bg-secondary/30 p-3 rounded-md">
                        <h5 className="font-semibold mb-1 flex items-center"><Percent size={16} className="mr-1.5 text-accent"/>Grasas:</h5>
                        <p>{report.nutritionalInfo.fats}</p>
                      </div>
                    </div>
                  </div>

                  {hasMacroData && (
                    <div>
                      <h4 className="font-semibold mb-3 text-lg flex items-center"><PieChartIcon size={20} className="mr-2 text-accent"/>Distribución de Macronutrientes (% de calorías):</h4>
                      <div className="h-64 md:h-80 w-full bg-secondary/30 p-4 rounded-md">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={macroData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius="80%"
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                            >
                              {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${(value as number).toFixed(1)}%`, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2 text-md"><Leaf size={18} className="mr-2 text-accent"/>Micronutrientes Clave (por persona):</h4>
                    {report.nutritionalInfo.keyMicronutrients.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-sm bg-secondary/30 p-3 rounded-md">
                        {report.nutritionalInfo.keyMicronutrients.map((micro, index) => (
                          <li key={index}>{micro}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic bg-secondary/30 p-3 rounded-md">No se especificaron micronutrientes clave.</p>
                    )}
                  </div>
                  {report.nutritionalInfo.notes && (
                    <div>
                      <h4 className="font-semibold mb-2 text-md"><Info size={18} className="mr-2 text-accent"/>Notas Adicionales (por persona):</h4>
                      <p className="text-sm italic text-muted-foreground bg-secondary/30 p-3 rounded-md">{report.nutritionalInfo.notes}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )})}
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-center py-6">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Mail className="mr-2 h-5 w-5" />
                Enviar por Correo Electrónico
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Enviar Informe Nutricional</DialogTitle>
                <DialogDescription>
                  Ingresa la dirección de correo electrónico a la que deseas enviar el informe.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
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
      </Card>
    </section>
  );
}
