
// This is an autogenerated file from Firebase Studio.
'use server';
/**
 * @fileOverview Generates a Chilean menu with suggested and optional lunches for a specified number of days and people,
 * including Peruvian and Latin American dishes popular in Chile, as well as European dishes adapted to Chilean taste.
 * Allows for dietary preferences like Vegetarian or Vegan, and additional restrictions like Gluten-Free or Lactose-Free.
 *
 * - generateMenu - A function that generates the menu.
 * - GenerateMenuInput - The input type for the generateMenu function.
 * - GenerateMenuOutput - The return type for the generateMenu function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMenuInputSchema = z.object({
  numberOfDays: z
    .number()
    .describe('El número de días para los cuales generar el menú.')
    .min(1),
  numberOfPeople: z
    .number()
    .describe('El número de personas para las cuales generar cada receta del menú.')
    .min(1)
    .max(16)
    .default(4),
  dietaryPreference: z
    .string()
    .optional()
    .describe('Preferencia dietética principal. Valores posibles: "Vegetariano", "Vegano". Si no se provee, se asume omnívoro.'),
  glutenFree: z
    .boolean()
    .optional()
    .describe('Indica si el menú completo debe ser sin gluten.'),
  lactoseFree: z
    .boolean()
    .optional()
    .describe('Indica si el menú completo debe ser sin lactosa.'),
});
export type GenerateMenuInput = z.infer<typeof GenerateMenuInputSchema>;

const CoreRecipeSchema = z.object({
  recipeName: z.string().describe('Nombre de la receta.'),
  ingredients: z.array(z.string()).describe('Lista de ingredientes para la receta, con cantidades para el número de personas especificado (ej: "Arroz: 2 tazas", "Carne Molida: 500g"). Deben ser consistentes con todas las preferencias y restricciones dietéticas especificadas.'),
  instructions: z.string().describe('Instrucciones para preparar la receta, consistentes con todas las preferencias y restricciones dietéticas especificadas.'),
  evocativeDescription: z.string().describe('Un texto inspirador, poético y ligeramente más extenso para incitar a cocinar y disfrutar el plato.'),
  suggestedMusic: z.string().describe('Una sugerencia de música (artista y canción, o un estilo/playlist) para escuchar mientras se cocina o come este plato.'),
  suggestedPairing: z.string().optional().describe('Una sugerencia de maridaje con vino o cerveza para el plato.'),
  imageDataUri: z.string().optional().describe('URI de datos de la imagen generada para el plato (opcional).'),
});
export type CoreRecipe = z.infer<typeof CoreRecipeSchema>;

const DailyMenuSchema = z.object({
  day: z.number().describe('El número del día en el menú.'),
  suggestedLunch: CoreRecipeSchema.describe('El almuerzo sugerido para este día.'),
  optionalLunch: CoreRecipeSchema.describe('El almuerzo opcional para este día.'),
});
export type DailyMenu = z.infer<typeof DailyMenuSchema>;

const GenerateMenuOutputSchema = z.object({
  menu: z.array(DailyMenuSchema).describe('El menú generado con almuerzos sugeridos y opcionales para cada día.'),
});
export type GenerateMenuOutput = z.infer<typeof GenerateMenuOutputSchema>;

export async function generateMenu(input: GenerateMenuInput): Promise<GenerateMenuOutput> {
  return generateMenuFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMenuPrompt',
  input: {schema: GenerateMenuInputSchema},
  output: {schema: GenerateMenuOutputSchema},
  config: {
    temperature: 0.9, 
  },
  prompt: `Eres un chef experto y CREATIVO. Tu misión es diseñar menús que sean balanceados, deliciosos y, fundamentalmente, MUY VARIADOS Y POCO REPETITIVOS.
Sorpréndeme con tu conocimiento profundo de la gastronomía chilena, peruana, una amplia gama de joyas culinarias latinoamericanas, y también platos de origen europeo que son comúnmente disfrutados y adaptados en Chile. Incluye platos caseros y tesoros menos conocidos pero igualmente exquisitos.

{{#if dietaryPreference}}
IMPORTANTE: Todas las recetas generadas deben adherirse estrictamente a la siguiente preferencia dietética principal: {{dietaryPreference}}.
Si la preferencia es "Vegetariano", todas las recetas deben ser estrictamente vegetarianas (sin carne de ningún tipo, incluyendo pescado y mariscos, pero pueden incluir huevos y lácteos). Los ingredientes y las instrucciones deben reflejar esto.
Si la preferencia es "Vegano", todas las recetas deben ser estrictamente veganas (sin ningún producto de origen animal, incluyendo carne, pescado, mariscos, huevos, lácteos, miel, etc.). Los ingredientes y las instrucciones deben reflejar esto.
Asegúrate de que las descripciones y nombres de los platos sean apropiados para esta preferencia.
{{else}}
Para este menú, considera una dieta omnívora, incluyendo una variedad de proteínas.
{{/if}}

{{#if glutenFree}}
RESTRICCIÓN ADICIONAL MUY IMPORTANTE: TODAS las recetas deben ser SIN GLUTEN. Esto significa que no deben contener trigo, cebada, centeno, ni derivados. Los ingredientes deben ser naturalmente sin gluten o certificados sin gluten (ej. harinas sin gluten, avena sin gluten si se usa). Las instrucciones deben ser consistentes con una preparación sin gluten.
{{/if}}

{{#if lactoseFree}}
RESTRICCIÓN ADICIONAL MUY IMPORTANTE: TODAS las recetas deben ser SIN LACTOSA. Esto significa que se deben usar productos lácteos sin lactosa, o alternativas vegetales (leche de almendras, queso vegano, etc.). Las instrucciones deben ser consistentes con una preparación sin lactosa.
{{/if}}

Si se especifican múltiples restricciones dietéticas (ej. Vegano Y Sin Gluten), las recetas deben cumplir TODAS las restricciones indicadas de manera combinada.

Para asegurar la variedad (dentro de las restricciones dietéticas si aplican), incluye diferentes tipos de proteínas (vacuno, cerdo, pollo, pescado, mariscos, legumbres, seitán, tofu, tempeh, huevos - ajustando según las restricciones si aplican), diversos métodos de cocción (guisos, horneados, salteados, a la parrilla, al vapor), y considera platos de distintas regiones de Chile y de otros países latinoamericanos y europeos que sean populares o que podrían serlo en el contexto chileno.
Evita sugerir platos que sean demasiado similares entre sí en días consecutivos o dentro de la misma semana.

Generarás un menú para {{numberOfDays}} días. Cada receta del menú debe ser para {{numberOfPeople}} personas.

Para cada receta (tanto sugerida como opcional), incluye:
- recipeName: Nombre de la receta.
- ingredients: Lista de ingredientes. Para cada ingrediente, especifica la cantidad necesaria para {{numberOfPeople}} personas de la forma más precisa posible (e.g., 'Arroz: 2 tazas', 'Tofu firme: 300g', 'Cebolla: 1 grande'). No uses guiones '-' al inicio de cada ingrediente, solo la cadena de texto con el ingrediente y su cantidad. Los ingredientes deben ser consistentes con TODAS las preferencias y restricciones dietéticas.
- instructions: Instrucciones detalladas de preparación, consistentes con TODAS las preferencias y restricciones dietéticas.
- evocativeDescription: Un texto inspirador, poético y un poco más extenso (2-3 frases) que invite a preparar y disfrutar el plato, evocando sensaciones y atmósferas.
- suggestedMusic: Una sugerencia de música o artista para crear el ambiente perfecto mientras cocinas o disfrutas de la comida. Sé creativo y relaciona la música con el estilo del plato (ej: "Los Jaivas - Todos Juntos" para un plato chileno tradicional, "Buena Vista Social Club" para algo con sabor caribeño, "Una playlist de jazz suave" para una cena elegante).
- suggestedPairing: Una sugerencia de maridaje con un vino (cepa y, si es posible, un ejemplo de viña chilena) o una cerveza artesanal chilena que complemente bien los sabores. Si el plato es muy simple, no es para niños, o no amerita maridaje, puedes omitir esta sugerencia.

No incluyas el campo imageDataUri en tu respuesta JSON, se generará por separado.
No incluyas desayunos ni cenas, solo las dos opciones de almuerzo por día.
Devuelve el menú en formato JSON.

Ejemplo de cómo debería ser la estructura para un día (este ejemplo es si {{numberOfPeople}} fuera 4 y la preferencia fuera omnívora, sin otras restricciones; debes ajustar las cantidades para el valor de {{numberOfPeople}} y las restricciones que se te provean):
{
  "day": 1,
  "suggestedLunch": {
    "recipeName": "Pastel de Choclo",
    "ingredients": ["Carne Molida: 500g", "Pollo: 1 pechuga", "Cebolla: 1 unidad", "Choclo: 5 tazas", "Leche: 1 taza", "Albahaca: a gusto", "Huevo Duro: 2 unidades", "Aceitunas: 8 unidades"],
    "instructions": "Preparar un pino con carne molida, pollo y cebolla. Aparte, moler choclo con leche y albahaca. En una fuente para horno, colocar el pino, huevo duro y aceitunas. Cubrir con la mezcla de choclo. Hornear hasta dorar.",
    "evocativeDescription": "Un abrazo de la tierra chilena, donde el dulzor del choclo se encuentra con el sabor profundo del pino. Es un plato que sabe a verano, a campo y a hogar.",
    "suggestedMusic": "Los Jaivas - 'Todos Juntos'",
    "suggestedPairing": "Un vino tinto chileno, como un Carmenere de cuerpo medio, realzará los sabores de la carne sin opacar el dulzor del choclo."
  },
  "optionalLunch": {
    "recipeName": "Lentejas con Arroz",
    "ingredients": ["Lentejas: 2 tazas", "Arroz: 2 tazas", "Cebolla: 1 unidad", "Zanahoria: 2 unidades", "Zapallo: 200g", "Longaniza (opcional): 2 unidades"],
    "instructions": "Remojar las lentejas. Cocinarlas con cebolla, zanahoria y zapallo picados. Agregar longaniza si se desea. Servir con arroz graneado.",
    "evocativeDescription": "Un plato humilde y poderoso, perfecto para recargar energías con el sabor de casa. Su aroma te transporta a la cocina de la abuela, una promesa de calidez y nutrición.",
    "suggestedMusic": "Víctor Jara - 'El Derecho de Vivir en Paz'",
    "suggestedPairing": "Una cerveza tipo Ale o Lager nacional complementa la sencillez y el sabor reconfortante de este plato."
  }
}

Asegúrate de que la salida sea solo el objeto JSON que se ajusta al esquema de salida. Las cantidades de los ingredientes deben ser calculadas con precisión para {{numberOfPeople}} personas. Si {{numberOfPeople}} es 1, asegúrate de que las cantidades sean para una sola persona.
Si se especifica alguna preferencia o restricción dietética, TODAS las recetas y sus ingredientes deben cumplirla estrictamente.
`,
});

const generateMenuFlow = ai.defineFlow(
  {
    name: 'generateMenuFlow',
    inputSchema: GenerateMenuInputSchema,
    outputSchema: GenerateMenuOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
