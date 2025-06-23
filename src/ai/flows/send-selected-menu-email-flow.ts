
// src/ai/flows/send-selected-menu-email-flow.ts
'use server';
/**
 * @fileOverview Sends the selected menu via email using Resend.
 *
 * - sendSelectedMenuEmail - A function that sends the email.
 * - SendSelectedMenuEmailInput - The input type for the function.
 * - SendSelectedMenuEmailOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';

const SelectedMenuItemSchema = z.object({
  day: z.number().describe('El número del día en el menú.'),
  recipeName: z.string().describe('Nombre de la receta seleccionada para el día.'),
  ingredients: z.array(z.string()).describe('Lista de ingredientes para la receta.'),
  instructions: z.string().describe('Instrucciones para preparar la receta.'),
  evocativeDescription: z.string().describe('Descripción evocadora de la receta.'),
  suggestedMusic: z.string().describe('Sugerencia musical para acompañar la receta.'),
});
export type SelectedMenuItem = z.infer<typeof SelectedMenuItemSchema>;

const SendSelectedMenuEmailInputSchema = z.object({
  recipientEmail: z.string().email('Debe ser una dirección de correo electrónico válida.'),
  selectedMenu: z.array(SelectedMenuItemSchema).describe('El menú seleccionado a enviar.'),
});
export type SendSelectedMenuEmailInput = z.infer<typeof SendSelectedMenuEmailInputSchema>;

const SendSelectedMenuEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendSelectedMenuEmailOutput = z.infer<typeof SendSelectedMenuEmailOutputSchema>;

function generateMenuEmailHtml(menu: SelectedMenuItem[]): string {
  const menuDaysHtml = menu.map(item => {
    const encodedRecipeName = encodeURIComponent(item.recipeName);
    const thermomixSearchUrl = `https://www.google.cl/search?q=${encodedRecipeName}+thermomix`;
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedRecipeName}`;
    
    return `
    <div style="margin-bottom: 25px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
      <h3 style="color: #c4392d; margin-top: 0; margin-bottom: 15px; font-size: 1.3em; border-bottom: 1px solid #eee; padding-bottom: 8px;">
        Día ${item.day}: ${item.recipeName}
      </h3>
      <p style="font-style: italic; color: #555; margin-bottom: 15px; font-size: 0.95em;">${item.evocativeDescription}</p>
      
      <h4 style="color: #d9534f; margin-top: 15px; margin-bottom: 8px; font-size: 1.1em;">Música Sugerida:</h4>
      <p style="color: #555; font-size: 0.9em;">🎵 ${item.suggestedMusic}</p>

      <h4 style="color: #d9534f; margin-top: 15px; margin-bottom: 8px; font-size: 1.1em;">Ingredientes:</h4>
      <ul style="color: #555; padding-left: 20px; margin-top: 0; margin-bottom:15px; font-size: 0.9em; list-style-type: disc;">
        ${item.ingredients.map(ing => `<li>${ing}</li>`).join('')}
      </ul>
      
      <h4 style="color: #d9534f; margin-top: 15px; margin-bottom: 8px; font-size: 1.1em;">Instrucciones:</h4>
      <p style="color: #555; white-space: pre-wrap; line-height: 1.5; font-size: 0.9em;">${item.instructions}</p>
      
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
        <h4 style="color: #d9534f; margin-top: 0; margin-bottom: 8px; font-size: 1.1em;">Recursos Adicionales:</h4>
        <ul style="padding-left: 20px; margin-top: 0; font-size: 0.9em; list-style-type: disc;">
            <li style="margin-bottom: 5px;"><a href="${thermomixSearchUrl}" target="_blank" style="text-decoration: none; color: #3498db;">Buscar receta para Thermomix</a></li>
            <li><a href="${youtubeSearchUrl}" target="_blank" style="text-decoration: none; color: #3498db;">Buscar en YouTube</a></li>
        </ul>
      </div>
    </div>
  `}).join('');

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 20px auto; padding: 25px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #E63946; text-align: center; border-bottom: 2px solid #F4DBD3; padding-bottom: 15px; margin-bottom: 25px;">Tu Menú Semanal de My Smart Menu</h2>
      <p style="font-size: 1.1em; margin-bottom: 25px;">Aquí tienes los detalles de tu menú seleccionado:</p>
      ${menuDaysHtml}
      <p style="margin-top: 30px; text-align: center; font-size: 0.9em; color: #777;">
        Generado por My Smart Menu. ¡A disfrutar de la cocina!
      </p>
    </div>
  `;
}

export async function sendSelectedMenuEmail(input: SendSelectedMenuEmailInput): Promise<SendSelectedMenuEmailOutput> {
  return sendSelectedMenuEmailFlow(input);
}

const sendSelectedMenuEmailFlow = ai.defineFlow(
  {
    name: 'sendSelectedMenuEmailFlow',
    inputSchema: SendSelectedMenuEmailInputSchema,
    outputSchema: SendSelectedMenuEmailOutputSchema,
  },
  async ({ recipientEmail, selectedMenu }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Error: RESEND_API_KEY no está configurada en las variables de entorno.');
      return { success: false, message: 'Error de configuración del servidor: La API Key de Resend no está disponible.' };
    }

    const resend = new Resend(apiKey);
    const emailHtml = generateMenuEmailHtml(selectedMenu);

    try {
      const { data, error } = await resend.emails.send({
        from: 'MySmartMenu <mysmartmenu@notifications.cl>',
        to: [recipientEmail],
        subject: 'Tu Menú Seleccionado de My Smart Menu',
        html: emailHtml,
      });

      if (error) {
        console.error('Resend API Error:', error);
        return { success: false, message: `Error al enviar el correo: ${error.message}` };
      }

      return { success: true, message: 'Correo con el menú seleccionado enviado exitosamente.' };
    } catch (e: any) {
      console.error('Error enviando correo de menú seleccionado:', e);
      return { success: false, message: `Ocurrió un error inesperado: ${e.message || 'Error desconocido'}` };
    }
  }
);
