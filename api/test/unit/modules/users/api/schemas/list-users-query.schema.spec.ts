import { listUsersQuerySchema } from '@/modules/users/api/schemas/list-users-query.schema';

describe('listUsersQuerySchema', () => {
  it('should parse pagination defaults with users sortBy default', () => {
    const result = listUsersQuerySchema.parse({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.sortOrder).toBe('DESC');
    expect(result.sortBy).toBe('createdAt');
  });

  it('should parse explicit sortBy and sortOrder values', () => {
    const result = listUsersQuerySchema.parse({
      page: '2',
      limit: '8',
      sortOrder: 'ASC',
      sortBy: 'profile',
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(8);
    expect(result.sortOrder).toBe('ASC');
    expect(result.sortBy).toBe('profile');
  });

  it('should reject invalid sortBy values', () => {
    expect(() => {
      listUsersQuerySchema.parse({ sortBy: 'invalid' });
    }).toThrow();
  });
});
