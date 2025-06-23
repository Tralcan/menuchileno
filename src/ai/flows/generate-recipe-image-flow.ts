'use server';
/**
 * @fileOverview Generates an image for a given recipe.
 *
 * - generateRecipeImage - A function that generates an image for a recipe.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeImageInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe for which to generate an image.'),
  evocativeDescription: z.string().optional().describe('An evocative description of the recipe to guide image generation.'),
});
export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

const GenerateRecipeImageOutputSchema = z.object({
  imageDataUri: z.string().optional().describe("The generated image as a data URI. Format: 'data:image/png;base64,<encoded_data>'. Can be undefined if generation fails."),
});
export type GenerateRecipeImageOutput = z.infer<typeof GenerateRecipeImageOutputSchema>;

export async function generateRecipeImage(input: GenerateRecipeImageInput): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async (input) => {
    const promptElements = [
      `Generate a visually appealing and realistic photo of a dish: "${input.recipeName}".`,
      `The image should be suitable for a recipe card. Focus on the food itself, well-lit and appetizing.`,
      `Style: Bright, clean, food photography.`,
    ];
    if (input.evocativeDescription) {
      promptElements.push(`Consider this description: "${input.evocativeDescription}"`);
    }
    
    const imagePrompt = promptElements.join(' ');

    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imagePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], 
          safetySettings: [ 
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      if (!media || !media.url) {
        console.error('Image generation did not return a media URL for prompt:', imagePrompt, 'Response media:', media);
        return { imageDataUri: undefined };
      }
      
      return { imageDataUri: media.url };
    } catch (error) {
      console.error(`Caught error during image generation for "${input.recipeName}":`, error);
      return { imageDataUri: undefined };
    }
  }
);
