// src/ai/flows/send-nutritional-report-email-flow.ts
'use server';
/**
 * @fileOverview Sends a nutritional report email using Resend.
 *
 * - sendNutritionalReportEmail - A function that sends the email.
 * - SendNutritionalReportEmailInput - The input type for the function.
 * - SendNutritionalReportEmailOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';
import type { RecipeNutritionalInfo } from './generate-nutritional-info-flow'; // Reusing the type

const SendNutritionalReportEmailInputSchema = z.object({
  recipientEmail: z.string().email('Debe ser una dirección de correo electrónico válida.'),
  nutritionalReport: z.array(
    z.object({
      recipeName: z.string(),
      nutritionalInfo: z.object({
        calories: z.string(),
        protein: z.string(),
        carbohydrates: z.string(),
        fats: z.string(),
        proteinPercentage: z.number(),
        carbohydratesPercentage: z.number(),
        fatsPercentage: z.number(),
        keyMicronutrients: z.array(z.string()),
        notes: z.string().optional(),
      }),
    })
  ).describe('El informe nutricional a enviar.'),
});
export type SendNutritionalReportEmailInput = z.infer<typeof SendNutritionalReportEmailInputSchema>;

const SendNutritionalReportEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendNutritionalReportEmailOutput = z.infer<typeof SendNutritionalReportEmailOutputSchema>;


function generateEmailHtml(report: RecipeNutritionalInfo[]): string {
  const recipesHtml = report.map(recipe => `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
      <h3 style="color: #c4392d; margin-top: 0; margin-bottom: 10px; font-size: 1.2em;">${recipe.recipeName}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 5px; color: #333;"><strong>Calorías:</strong></td><td style="padding: 5px; color: #555;">${recipe.nutritionalInfo.calories}</td></tr>
        <tr><td style="padding: 5px; color: #333;"><strong>Proteínas:</strong></td><td style="padding: 5px; color: #555;">${recipe.nutritionalInfo.protein} (${recipe.nutritionalInfo.proteinPercentage.toFixed(0)}%)</td></tr>
        <tr><td style="padding: 5px; color: #333;"><strong>Carbohidratos:</strong></td><td style="padding: 5px; color: #555;">${recipe.nutritionalInfo.carbohydrates} (${recipe.nutritionalInfo.carbohydratesPercentage.toFixed(0)}%)</td></tr>
        <tr><td style="padding: 5px; color: #333;"><strong>Grasas:</strong></td><td style="padding: 5px; color: #555;">${recipe.nutritionalInfo.fats} (${recipe.nutritionalInfo.fatsPercentage.toFixed(0)}%)</td></tr>
      </table>
      ${recipe.nutritionalInfo.keyMicronutrients.length > 0 ? `
        <h4 style="color: #d9534f; margin-top: 15px; margin-bottom: 5px; font-size: 1em;">Micronutrientes Clave:</h4>
        <ul style="color: #555; padding-left: 20px; margin-top: 0; font-size: 0.9em;">
          ${recipe.nutritionalInfo.keyMicronutrients.map(m => `<li>${m}</li>`).join('')}
        </ul>
      ` : ''}
      ${recipe.nutritionalInfo.notes ? `
        <h4 style="color: #d9534f; margin-top: 15px; margin-bottom: 5px; font-size: 1em;">Notas Adicionales:</h4>
        <p style="color: #555; font-style: italic; margin-top: 0; font-size: 0.9em;">${recipe.nutritionalInfo.notes}</p>
      ` : ''}
    </div>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #E63946; text-align: center; border-bottom: 2px solid #F4DBD3; padding-bottom: 10px;">Tu Informe Nutricional de My Smart Menu</h2>
      <p style="font-size: 1.1em; margin-bottom: 20px;">Aquí tienes el detalle nutricional por persona para los platos seleccionados:</p>
      ${recipesHtml}
      <p style="margin-top: 30px; text-align: center; font-size: 0.9em; color: #777;">
        Generado por My Smart Menu. ¡Buen provecho!
      </p>
    </div>
  `;
}


export async function sendNutritionalReportEmail(input: SendNutritionalReportEmailInput): Promise<SendNutritionalReportEmailOutput> {
  return sendNutritionalReportEmailFlow(input);
}

const sendNutritionalReportEmailFlow = ai.defineFlow(
  {
    name: 'sendNutritionalReportEmailFlow',
    inputSchema: SendNutritionalReportEmailInputSchema,
    outputSchema: SendNutritionalReportEmailOutputSchema,
  },
  async ({ recipientEmail, nutritionalReport }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Error: RESEND_API_KEY no está configurada en las variables de entorno.');
      return { success: false, message: 'Error de configuración del servidor: La API Key de Resend no está disponible.' };
    }

    const resend = new Resend(apiKey);
    const emailHtml = generateEmailHtml(nutritionalReport);

    try {
      const { data, error } = await resend.emails.send({
        from: 'MySmartMenu <mysmartmenu@notifications.cl>', 
        to: [recipientEmail],
        subject: 'Tu Informe Nutricional de My Smart Menu',
        html: emailHtml,
      });

      if (error) {
        console.error('Resend API Error:', error);
        return { success: false, message: `Error al enviar el correo: ${error.message}` };
      }

      return { success: true, message: 'Correo enviado exitosamente.' };
    } catch (e: any) {
      console.error('Error enviando correo:', e);
      return { success: false, message: `Ocurrió un error inesperado: ${e.message || 'Error desconocido'}` };
    }
  }
);
