import { config } from 'dotenv';
config();

import '@/ai/flows/create-shopping-list.ts';
import '@/ai/flows/generate-menu.ts';
import '@/ai/flows/generate-recipe-image-flow.ts';
import '@/ai/flows/generate-nutritional-info-flow.ts';
import '@/ai/flows/send-nutritional-report-email-flow.ts';
