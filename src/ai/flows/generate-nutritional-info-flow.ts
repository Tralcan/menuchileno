
// src/ai/flows/generate-nutritional-info-flow.ts
'use server';
/**
 * @fileOverview Generates detailed nutritional information for selected recipes, adjusted for a specific number of people.
 *
 * - generateNutritionalInfo - A function that generates nutritional information.
 * - GenerateNutritionalInfoInput - The input type for the generateNutritionalInfo function.
 * - GenerateNutritionalInfoOutput - The return type for the generateNutritionalInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalRecipeInputSchema = z.object({
  recipeName: z.string().describe('Name of the dish.'),
  ingredients: z.array(z.string()).describe('List of ingredients for the dish, with quantities for the specified number of people.'),
});
export type NutritionalRecipeInput = z.infer<typeof NutritionalRecipeInputSchema>;

const GenerateNutritionalInfoInputSchema = z.object({
  selectedRecipes: z.array(NutritionalRecipeInputSchema).describe('The selected recipes for which to generate nutritional information.'),
  numberOfPeople: z.number().describe('The number of people for whom each recipe (and thus its nutritional info) is calculated.'),
});
export type GenerateNutritionalInfoInput = z.infer<typeof GenerateNutritionalInfoInputSchema>;

const NutritionalDetailSchema = z.object({
  calories: z.string().describe('Estimated total calories for the dish (for the specified number of people). Example: "550 kcal"'),
  protein: z.string().describe('Estimated total protein in grams for the dish (for the specified number of people). Example: "30g"'),
  carbohydrates: z.string().describe('Estimated total carbohydrates in grams for the dish (for the specified number of people). Example: "45g"'),
  fats: z.string().describe('Estimated total fats in grams for the dish (for the specified number of people). Example: "20g"'),
  keyMicronutrients: z.array(z.string()).describe('List of key vitamins and minerals present in significant amounts, with their general level (e.g., "Vitamina C: Alta", "Hierro: Buena fuente", "Calcio: Moderado").'),
  notes: z.string().optional().describe('Any additional nutritional notes or advice for the dish. Example: "Este plato es una excelente fuente de fibra."'),
});
export type NutritionalDetail = z.infer<typeof NutritionalDetailSchema>;

const RecipeNutritionalInfoSchema = z.object({
  recipeName: z.string().describe('Name of the dish.'),
  nutritionalInfo: NutritionalDetailSchema.describe('Detailed nutritional information for the dish.'),
});
export type RecipeNutritionalInfo = z.infer<typeof RecipeNutritionalInfoSchema>;

const GenerateNutritionalInfoOutputSchema = z.object({
  nutritionalReport: z.array(RecipeNutritionalInfoSchema).describe('A report containing nutritional information for each selected recipe.'),
});
export type GenerateNutritionalInfoOutput = z.infer<typeof GenerateNutritionalInfoOutputSchema>;


export async function generateNutritionalInfo(input: GenerateNutritionalInfoInput): Promise<GenerateNutritionalInfoOutput> {
  return generateNutritionalInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNutritionalInfoPrompt',
  input: {schema: GenerateNutritionalInfoInputSchema},
  output: {schema: GenerateNutritionalInfoOutputSchema},
  prompt: `Eres un nutricionista experto. Para cada uno de los siguientes platos, basándote en sus ingredientes, proporciona un análisis nutricional detallado y lo más preciso posible.
Cada receta está calculada para {{numberOfPeople}} personas, por lo que la información nutricional debe reflejar el total para las {{numberOfPeople}} porciones (es decir, el plato completo).

Para cada plato, incluye:
- recipeName: El nombre del plato (ya proporcionado en la entrada, solo repítelo para la estructura de salida).
- nutritionalInfo: Un objeto con:
  - calories: Calorías totales estimadas para el plato completo ({{numberOfPeople}} personas). Ejemplo: "600 kcal".
  - protein: Gramos de proteína totales estimados para el plato completo ({{numberOfPeople}} personas). Ejemplo: "40g".
  - carbohydrates: Gramos de carbohidratos totales estimados para el plato completo ({{numberOfPeople}} personas). Ejemplo: "55g".
  - fats: Gramos de grasas totales estimados para el plato completo ({{numberOfPeople}} personas). Ejemplo: "25g".
  - keyMicronutrients: Una lista de cadenas describiendo vitaminas y minerales clave presentes en cantidades significativas y su nivel general (ej. "Vitamina A: Alta", "Hierro: Buena fuente", "Potasio: Moderado").
  - notes: (Opcional) Notas nutricionales adicionales, consejos o beneficios del plato. Ejemplo: "Este plato es rico en antioxidantes y fibra." o "Una buena opción para después de hacer ejercicio por su contenido proteico."

Platos a analizar (cada uno para {{numberOfPeople}} personas):
{{#each selectedRecipes}}
- Nombre del plato: {{this.recipeName}}
  Ingredientes: {{#each this.ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Considera los ingredientes proporcionados para cada plato para realizar tu análisis. La información debe ser clara, fácil de entender y útil.
Devuelve la información estrictamente en el formato JSON especificado en el esquema de salida. No incluyas explicaciones adicionales fuera del JSON.
`,
});

const generateNutritionalInfoFlow = ai.defineFlow(
  {
    name: 'generateNutritionalInfoFlow',
    inputSchema: GenerateNutritionalInfoInputSchema,
    outputSchema: GenerateNutritionalInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
