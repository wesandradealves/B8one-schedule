import { z } from 'zod';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toTimeMinutes = (value: string): number => {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  return hours * 60 + minutes;
};

export const updateExamSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(3000).nullable().optional(),
    durationMinutes: z.coerce.number().int().positive().optional(),
    priceCents: z.coerce.number().int().nonnegative().optional(),
    availableWeekdays: z
      .array(z.coerce.number().int().min(0).max(6))
      .min(1)
      .max(7)
      .optional(),
    availableStartTime: z.string().regex(TIME_PATTERN).optional(),
    availableEndTime: z.string().regex(TIME_PATTERN).optional(),
    availableFromDate: z.string().regex(DATE_PATTERN).nullable().optional(),
    availableToDate: z.string().regex(DATE_PATTERN).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) => {
      if (!value.availableStartTime || !value.availableEndTime) {
        return true;
      }

      return toTimeMinutes(value.availableStartTime) < toTimeMinutes(value.availableEndTime);
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
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.durationMinutes !== undefined ||
      value.priceCents !== undefined ||
      value.availableWeekdays !== undefined ||
      value.availableStartTime !== undefined ||
      value.availableEndTime !== undefined ||
      value.availableFromDate !== undefined ||
      value.availableToDate !== undefined ||
      value.isActive !== undefined,
    {
      message: 'At least one field must be provided',
      path: [],
    },
  )
  .transform((value) => ({
    ...value,
    availableWeekdays:
      value.availableWeekdays === undefined
        ? undefined
        : [...new Set(value.availableWeekdays)].sort((first, second) => first - second),
  }));

export type UpdateExamSchemaType = z.infer<typeof updateExamSchema>;
