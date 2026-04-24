import { downloadCsvFile, isCsvFile } from '@/utils/csv';

describe('csv utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should detect valid csv files by extension and mime type', () => {
    const byExtension = new File(['a,b'], 'items.csv', { type: '' });
    const byTextCsvType = new File(['a,b'], 'items.txt', { type: 'text/csv' });
    const byExcelType = new File(['a,b'], 'items.txt', {
      type: 'application/vnd.ms-excel',
    });
    const invalid = new File(['a,b'], 'items.txt', { type: 'text/plain' });

    expect(isCsvFile(byExtension)).toBe(true);
    expect(isCsvFile(byTextCsvType)).toBe(true);
    expect(isCsvFile(byExcelType)).toBe(true);
    expect(isCsvFile(invalid)).toBe(false);
  });

  it('should download csv content using browser APIs', () => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: jest.fn().mockReturnValue('blob://csv-url'),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: jest.fn(),
      configurable: true,
      writable: true,
    });
    const createObjectUrlMock = URL.createObjectURL as jest.Mock;
    const revokeObjectUrlMock = URL.revokeObjectURL as jest.Mock;
    const clickMock = jest.fn();
    const createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockReturnValue({ click: clickMock } as unknown as HTMLAnchorElement);

    downloadCsvFile('exams.csv', 'name,durationMinutes');

    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob://csv-url');
  });
});
