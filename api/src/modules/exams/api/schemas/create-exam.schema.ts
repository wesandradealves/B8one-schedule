import { z } from 'zod';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toTimeMinutes = (value: string): number => {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  return hours * 60 + minutes;
};

export const createExamSchema = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(3000).nullable().optional(),
  durationMinutes: z.coerce.number().int().positive(),
  priceCents: z.coerce.number().int().nonnegative(),
  availableWeekdays: z
    .array(z.coerce.number().int().min(0).max(6))
    .min(1)
    .max(7)
    .optional(),
  availableStartTime: z.string().regex(TIME_PATTERN).optional(),
  availableEndTime: z.string().regex(TIME_PATTERN).optional(),
  availableFromDate: z.string().regex(DATE_PATTERN).nullable().optional(),
  availableToDate: z.string().regex(DATE_PATTERN).nullable().optional(),
})
  .refine(
    (value) => {
      const start = value.availableStartTime ?? '07:00';
      const end = value.availableEndTime ?? '19:00';
      return toTimeMinutes(start) < toTimeMinutes(end);
    },
    {
      message: 'availableEndTime must be greater than availableStartTime',
      path: ['availableEndTime'],
    },
  )
  .refine(
    (value) => {
      if (!value.availableFromDate || !value.availableToDate) {
        return true;
      }

      return value.availableFromDate <= value.availableToDate;
    },
    {
      message: 'availableToDate must be greater than or equal to availableFromDate',
      path: ['availableToDate'],
    },
  )
  .transform((value) => ({
    ...value,
    availableWeekdays:
      value.availableWeekdays === undefined
        ? undefined
        : [...new Set(value.availableWeekdays)].sort((first, second) => first - second),
  }));

export type CreateExamSchemaType = z.infer<typeof createExamSchema>;
