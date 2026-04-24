import { listExamsQuerySchema } from '@/modules/exams/api/schemas/list-exams-query.schema';

describe('listExamsQuerySchema', () => {
  it('should parse pagination defaults with sortBy default', () => {
    const result = listExamsQuerySchema.parse({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.sortOrder).toBe('DESC');
    expect(result.sortBy).toBe('createdAt');
  });

  it('should parse explicit sortBy and sortOrder values', () => {
    const result = listExamsQuerySchema.parse({
      page: '2',
      limit: '8',
      sortOrder: 'ASC',
      sortBy: 'priceCents',
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(8);
    expect(result.sortOrder).toBe('ASC');
    expect(result.sortBy).toBe('priceCents');
  });

  it('should reject invalid sortBy values', () => {
    expect(() => {
      listExamsQuerySchema.parse({ sortBy: 'invalid' });
    }).toThrow();
  });
});

