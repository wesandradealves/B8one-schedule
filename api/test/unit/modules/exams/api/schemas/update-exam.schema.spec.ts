import { updateExamSchema } from '@/modules/exams/api/schemas/update-exam.schema';

describe('updateExamSchema', () => {
  it('parses partial availability updates', () => {
    const result = updateExamSchema.parse({
      availableWeekdays: [2, 4, 2],
      availableFromDate: null,
      availableToDate: '2026-11-30',
    });

    expect(result.availableWeekdays).toEqual([2, 4]);
    expect(result.availableFromDate).toBeNull();
    expect(result.availableToDate).toBe('2026-11-30');
  });

  it('rejects invalid payloads', () => {
    expect(() => {
      updateExamSchema.parse({
        availableStartTime: '20:00',
        availableEndTime: '08:00',
      });
    }).toThrow();

    expect(() => {
      updateExamSchema.parse({});
    }).toThrow();
  });
});

