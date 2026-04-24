import { z } from 'zod';

export const csvImportSchema = z.object({
  csvContent: z.string().trim().min(1, 'csvContent is required'),
});

export type CsvImportSchemaType = z.infer<typeof csvImportSchema>;
