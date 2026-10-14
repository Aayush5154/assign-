import { z } from 'zod';

export const categorySchema = z.enum([
  'technology',
  'business',
  'finance',
  'sports',
  'entertainment',
  'science',
  'health',
]);

export const preferencesSchema = z.object({
  categories: z.array(categorySchema).min(1, 'Select at least one interest').max(7),
  personalizedMode: z.boolean(),
});

export const searchSchema = z.object({
  q: z.string().trim().min(1, 'Enter a search term').max(100),
});

export type PreferencesFormValues = z.infer<typeof preferencesSchema>;
