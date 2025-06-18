// src/ai/flows/send-shopping-list-email-flow.ts
'use server';
/**
 * @fileOverview Sends a shopping list email using Resend.
 *
 * - sendShoppingListEmail - A function that sends the email.
 * - SendShoppingListEmailInput - The input type for the function.
 * - SendShoppingListEmailOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';

const SendShoppingListEmailInputSchema = z.object({
  recipientEmail: z.string().email('Debe ser una dirección de correo electrónico válida.'),
  shoppingList: z.array(z.string()).describe('La lista de compras a enviar.'),
});
export type SendShoppingListEmailInput = z.infer<typeof SendShoppingListEmailInputSchema>;

const SendShoppingListEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendShoppingListEmailOutput = z.infer<typeof SendShoppingListEmailOutputSchema>;

function generateEmailHtml(list: string[]): string {
  const itemsHtml = list.map(item => `<li style="margin-bottom: 8px; padding: 5px; background-color: #f9f9f9; border-left: 3px solid #F49D1A;">${item}</li>`).join('');

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #E63946; text-align: center; border-bottom: 2px solid #F4DBD3; padding-bottom: 10px;">Tu Lista de Compras de My Smart Menu</h2>
      <p style="font-size: 1.1em; margin-bottom: 20px;">Aquí tienes tu lista de compras:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        ${itemsHtml}
      </ul>
      <p style="margin-top: 30px; text-align: center; font-size: 0.9em; color: #777;">
        Generado por My Smart Menu. ¡Felices compras!
      </p>
    </div>
  `;
}

export async function sendShoppingListEmail(input: SendShoppingListEmailInput): Promise<SendShoppingListEmailOutput> {
  return sendShoppingListEmailFlow(input);
}

const sendShoppingListEmailFlow = ai.defineFlow(
  {
    name: 'sendShoppingListEmailFlow',
    inputSchema: SendShoppingListEmailInputSchema,
    outputSchema: SendShoppingListEmailOutputSchema,
  },
  async ({ recipientEmail, shoppingList }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Error: RESEND_API_KEY no está configurada en las variables de entorno.');
      return { success: false, message: 'Error de configuración del servidor: La API Key de Resend no está disponible.' };
    }

    const resend = new Resend(apiKey);
    const emailHtml = generateEmailHtml(shoppingList);

    try {
      const { data, error } = await resend.emails.send({
        from: 'MySmartMenu <mysmartmenu@notifications.cl>',
        to: [recipientEmail],
        subject: 'Tu Lista de Compras de My Smart Menu',
        html: emailHtml,
      });

      if (error) {
        console.error('Resend API Error:', error);
        return { success: false, message: `Error al enviar el correo: ${error.message}` };
      }

      return { success: true, message: 'Correo con la lista de compras enviado exitosamente.' };
    } catch (e: any) {
      console.error('Error enviando correo de lista de compras:', e);
      return { success: false, message: `Ocurrió un error inesperado: ${e.message || 'Error desconocido'}` };
    }
  }
);
