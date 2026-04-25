import { listAppointmentAvailabilityQuerySchema } from '@/modules/appointments/api/schemas/list-appointment-availability-query.schema';

describe('listAppointmentAvailabilityQuerySchema', () => {
  it('parses valid availability query params', () => {
    const result = listAppointmentAvailabilityQuerySchema.parse({
      examId: '68f678c6-0558-45ce-a117-9e3d11d2f8db',
      startsAt: '2026-05-01T00:00:00.000Z',
      endsAt: '2026-05-07T23:59:59.999Z',
    });

    expect(result.examId).toBe('68f678c6-0558-45ce-a117-9e3d11d2f8db');
    expect(result.startsAt).toBeInstanceOf(Date);
    expect(result.endsAt).toBeInstanceOf(Date);
  });

  it('rejects invalid values', () => {
    expect(() => {
      listAppointmentAvailabilityQuerySchema.parse({
        examId: 'invalid-id',
        startsAt: '2026-05-01T00:00:00.000Z',
        endsAt: '2026-05-07T23:59:59.999Z',
      });
    }).toThrow();

    expect(() => {
      listAppointmentAvailabilityQuerySchema.parse({
        examId: '68f678c6-0558-45ce-a117-9e3d11d2f8db',
        startsAt: '2026-05-07T23:59:59.999Z',
        endsAt: '2026-05-01T00:00:00.000Z',
      });
    }).toThrow();
  });
});
