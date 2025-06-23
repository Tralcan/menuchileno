
// src/ai/flows/generate-nutritional-info-flow.ts
'use server';
/**
 * @fileOverview Generates detailed nutritional information for selected recipes, per person.
 *
 * - generateNutritionalInfo - A function that generates nutritional information.
 * - GenerateNutritionalInfoInput - The input type for the generateNutritionalInfo function.
 * - GenerateNutritionalInfoOutput - The return type for the generateNutritionalInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalRecipeInputSchema = z.object({
  recipeName: z.string().describe('Name of the dish.'),
  ingredients: z.array(z.string()).describe('List of ingredients for the dish, with quantities originally calculated for a specific number of people.'),
  numberOfOriginalServings: z.number().describe('The number of people the original recipe was intended for. This is used to calculate per-person nutritional info.'),
});
export type NutritionalRecipeInput = z.infer<typeof NutritionalRecipeInputSchema>;

const GenerateNutritionalInfoInputSchema = z.object({
  selectedRecipes: z.array(NutritionalRecipeInputSchema).describe('The selected recipes for which to generate nutritional information.'),
  // numberOfPeople prop is removed as calculations are now per person based on numberOfOriginalServings for each recipe.
});
export type GenerateNutritionalInfoInput = z.infer<typeof GenerateNutritionalInfoInputSchema>;

const NutritionalDetailSchema = z.object({
  calories: z.string().describe('Estimated total calories for one person. Example: "550 kcal"'),
  protein: z.string().describe('Estimated total protein in grams for one person. Example: "30g"'),
  carbohydrates: z.string().describe('Estimated total carbohydrates in grams for one person. Example: "45g"'),
  fats: z.string().describe('Estimated total fats in grams for one person. Example: "20g"'),
  proteinPercentage: z.number().describe('Percentage of total calories from protein for one person (number, e.g., 20 for 20%).'),
  carbohydratesPercentage: z.number().describe('Percentage of total calories from carbohydrates for one person (number, e.g., 50 for 50%).'),
  fatsPercentage: z.number().describe('Percentage of total calories from fats for one person (number, e.g., 30 for 30%).'),
  keyMicronutrients: z.array(z.string()).describe('List of key vitamins and minerals present in significant amounts per person, with their general level (e.g., "Vitamina C: Alta", "Hierro: Buena fuente", "Calcio: Moderado").'),
  notes: z.string().optional().describe('Any additional nutritional notes or advice for the dish, relevant per person. Example: "Este plato es una excelente fuente de fibra."'),
});
export type NutritionalDetail = z.infer<typeof NutritionalDetailSchema>;

const RecipeNutritionalInfoSchema = z.object({
  recipeName: z.string().describe('Name of the dish.'),
  nutritionalInfo: NutritionalDetailSchema.describe('Detailed nutritional information for the dish, per person.'),
});
export type RecipeNutritionalInfo = z.infer<typeof RecipeNutritionalInfoSchema>;

const GenerateNutritionalInfoOutputSchema = z.object({
  nutritionalReport: z.array(RecipeNutritionalInfoSchema).describe('A report containing nutritional information for each selected recipe, per person.'),
});
export type GenerateNutritionalInfoOutput = z.infer<typeof GenerateNutritionalInfoOutputSchema>;


export async function generateNutritionalInfo(input: GenerateNutritionalInfoInput): Promise<GenerateNutritionalInfoOutput> {
  return generateNutritionalInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNutritionalInfoPrompt',
  input: {schema: GenerateNutritionalInfoInputSchema},
  output: {schema: GenerateNutritionalInfoOutputSchema},
  config: {
    temperature: 0.3,
  },
  prompt: `Eres un nutricionista experto. Para cada uno de los siguientes platos, basándote en sus ingredientes y el número original de porciones para el que fue calculada la receta, proporciona un análisis nutricional detallado y lo más preciso posible POR PERSONA.

La receta original para cada plato fue pensada para un número específico de personas (numberOfOriginalServings). Debes calcular y devolver la información nutricional para UNA SOLA PORCIÓN/PERSONA.

Para cada plato, incluye (por persona):
- recipeName: El nombre del plato.
- nutritionalInfo: Un objeto con:
  - calories: Calorías totales estimadas por persona. Ejemplo: "600 kcal".
  - protein: Gramos de proteína totales estimados por persona. Ejemplo: "40g".
  - carbohydrates: Gramos de carbohidratos totales estimados por persona. Ejemplo: "55g".
  - fats: Gramos de grasas totales estimados por persona. Ejemplo: "25g".
  - proteinPercentage: Porcentaje de calorías provenientes de proteínas (solo el número, ej. 20 para 20%).
  - carbohydratesPercentage: Porcentaje de calorías provenientes de carbohidratos (solo el número, ej. 50 para 50%).
  - fatsPercentage: Porcentaje de calorías provenientes de grasas (solo el número, ej. 30 para 30%).
    (La suma de estos tres porcentajes debe aproximarse a 100).
  - keyMicronutrients: Una lista de cadenas describiendo vitaminas y minerales clave presentes en cantidades significativas por persona y su nivel general (ej. "Vitamina A: Alta", "Hierro: Buena fuente", "Potasio: Moderado").
  - notes: (Opcional) Notas nutricionales adicionales, consejos o beneficios del plato, relevantes por persona.

Platos a analizar:
{{#each selectedRecipes}}
- Nombre del plato: {{this.recipeName}}
  Ingredientes (para {{this.numberOfOriginalServings}} personas): {{#each this.ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Número original de porciones: {{this.numberOfOriginalServings}}
  **IMPORTANTE**: Calcula y devuelve la información nutricional para UNA SOLA PERSONA.
{{/each}}

Considera los ingredientes proporcionados para cada plato para realizar tu análisis. La información debe ser clara, fácil de entender y útil.
Asegúrate de que los porcentajes de macronutrientes sean numéricos.
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
