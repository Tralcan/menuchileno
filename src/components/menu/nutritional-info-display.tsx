
// src/components/menu/nutritional-info-display.tsx
import type { RecipeNutritionalInfo } from '@/ai/flows/generate-nutritional-info-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardList, Activity, Percent, Flame, Wheat, Drumstick, Leaf, Info, Users } from 'lucide-react';

interface NutritionalInfoDisplayProps {
  nutritionalReport: RecipeNutritionalInfo[];
  numberOfPeople: number;
}

export default function NutritionalInfoDisplay({ nutritionalReport, numberOfPeople }: NutritionalInfoDisplayProps) {
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
            <Users size={16} /> Información nutricional estimada para los almuerzos seleccionados (para {numberOfPeople} {numberOfPeople === 1 ? 'persona' : 'personas'} por plato).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={nutritionalReport.map(report => report.recipeName)} className="w-full space-y-4">
            {nutritionalReport.map((report) => (
              <AccordionItem value={report.recipeName} key={report.recipeName} className="bg-card rounded-lg shadow-md overflow-hidden border-none">
                <AccordionTrigger className="px-6 py-4 text-xl font-headline hover:bg-secondary/50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="text-primary" /> {report.recipeName}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-secondary/30 p-3 rounded-md">
                      <h4 className="font-semibold mb-1 flex items-center"><Flame size={16} className="mr-1.5 text-accent"/>Calorías:</h4>
                      <p>{report.nutritionalInfo.calories}</p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-md">
                      <h4 className="font-semibold mb-1 flex items-center"><Drumstick size={16} className="mr-1.5 text-accent"/>Proteínas:</h4>
                      <p>{report.nutritionalInfo.protein}</p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-md">
                      <h4 className="font-semibold mb-1 flex items-center"><Wheat size={16} className="mr-1.5 text-accent"/>Carbohidratos:</h4>
                      <p>{report.nutritionalInfo.carbohydrates}</p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-md">
                      <h4 className="font-semibold mb-1 flex items-center"><Percent size={16} className="mr-1.5 text-accent"/>Grasas:</h4>
                      <p>{report.nutritionalInfo.fats}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center text-md"><Leaf size={18} className="mr-2 text-accent"/>Micronutrientes Clave:</h4>
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
                      <h4 className="font-semibold mb-2 flex items-center text-md"><Info size={18} className="mr-2 text-accent"/>Notas Adicionales:</h4>
                      <p className="text-sm italic text-muted-foreground bg-secondary/30 p-3 rounded-md">{report.nutritionalInfo.notes}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}
