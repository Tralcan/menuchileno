// src/ai/flows/create-shopping-list.ts
'use server';

/**
 * @fileOverview Generates a consolidated shopping list from a given menu, tailored for Chilean supermarkets.
 *
 * - createShoppingList - A function that generates a shopping list.
 * - CreateShoppingListInput - The input type for the createShoppingList function.
 * - CreateShoppingListOutput - The return type for the createShoppingList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateShoppingListInputSchema = z.object({
  menu: z.array(
    z.object({
      dishName: z.string().describe('Name of the dish.'),
      ingredients: z.array(z.string()).describe('List of ingredients for the dish.'),
    })
  ).describe('The menu for which to generate a shopping list.'),
});
export type CreateShoppingListInput = z.infer<typeof CreateShoppingListInputSchema>;

const CreateShoppingListOutputSchema = z.object({
  shoppingList: z.array(z.string()).describe('A consolidated shopping list for the menu.'),
});
export type CreateShoppingListOutput = z.infer<typeof CreateShoppingListOutputSchema>;

export async function createShoppingList(input: CreateShoppingListInput): Promise<CreateShoppingListOutput> {
  return createShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createShoppingListPrompt',
  input: {schema: CreateShoppingListInputSchema},
  output: {schema: CreateShoppingListOutputSchema},
  prompt: `You are a helpful assistant specialized in creating shopping lists for Chilean supermarkets.

  Based on the following menu, create a consolidated shopping list, grouping similar ingredients and considering common Chilean supermarket brands and product variants.

  Menu:
  {{#each menu}}
  - {{this.dishName}}: {{this.ingredients}}
  {{/each}}

  Consider the list should be easy to follow and efficient for shopping in Chile.
  Return only the list of ingredients. Do not include any additional text.  The list should be as concise as possible.
  `,
});

const createShoppingListFlow = ai.defineFlow(
  {
    name: 'createShoppingListFlow',
    inputSchema: CreateShoppingListInputSchema,
    outputSchema: CreateShoppingListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
