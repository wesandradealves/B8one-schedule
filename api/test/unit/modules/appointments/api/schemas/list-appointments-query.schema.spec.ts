import { listAppointmentsQuerySchema } from '@/modules/appointments/api/schemas/list-appointments-query.schema';

describe('listAppointmentsQuerySchema', () => {
  it('should parse pagination defaults', () => {
    const result = listAppointmentsQuerySchema.parse({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.sortOrder).toBe('DESC');
    expect(result.scheduledDate).toBeUndefined();
  });

  it('should parse valid scheduledDate in YYYY-MM-DD format', () => {
    const result = listAppointmentsQuerySchema.parse({
      page: '2',
      limit: '8',
      sortOrder: 'ASC',
      scheduledDate: '2026-05-01',
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(8);
    expect(result.sortOrder).toBe('ASC');
    expect(result.scheduledDate).toBe('2026-05-01');
  });

  it('should reject invalid scheduledDate values', () => {
    expect(() => {
      listAppointmentsQuerySchema.parse({ scheduledDate: '2026-99-99' });
    }).toThrow();

    expect(() => {
      listAppointmentsQuerySchema.parse({ scheduledDate: '01-05-2026' });
    }).toThrow();
  });
});
