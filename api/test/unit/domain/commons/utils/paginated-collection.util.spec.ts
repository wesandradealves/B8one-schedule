import { collectAllPaginatedData } from '@/domain/commons/utils/paginated-collection.util';

describe('paginated-collection.util', () => {
  it('collects all pages in sequence', async () => {
    const listFn = jest
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: '1' }],
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        data: [{ id: '2' }, { id: '3' }],
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
      });

    const result = await collectAllPaginatedData(listFn, 2);

    expect(listFn).toHaveBeenNthCalledWith(1, { page: 1, limit: 2 });
    expect(listFn).toHaveBeenNthCalledWith(2, { page: 2, limit: 2 });
    expect(result).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
  });
});
