import { createExamSchema } from '@/modules/exams/api/schemas/create-exam.schema';

describe('createExamSchema', () => {
  it('parses valid payload with availability fields', () => {
    const result = createExamSchema.parse({
      name: 'Hemograma',
      description: 'Descrição',
      durationMinutes: 20,
      priceCents: 4500,
      availableWeekdays: [5, 1, 3, 1],
      availableStartTime: '08:00',
      availableEndTime: '18:00',
      availableFromDate: '2026-05-01',
      availableToDate: '2026-12-31',
    });

    expect(result.availableWeekdays).toEqual([1, 3, 5]);
  });

  it('rejects invalid availability ranges', () => {
    expect(() => {
      createExamSchema.parse({
        name: 'Hemograma',
        durationMinutes: 20,
        priceCents: 4500,
        availableStartTime: '19:00',
        availableEndTime: '07:00',
      });
    }).toThrow();

    expect(() => {
      createExamSchema.parse({
        name: 'Hemograma',
        durationMinutes: 20,
        priceCents: 4500,
        availableFromDate: '2026-12-31',
        availableToDate: '2026-01-01',
      });
    }).toThrow();
  });
});

