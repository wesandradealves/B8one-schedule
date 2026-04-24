import { act, renderHook } from '@testing-library/react';
import { useCsvActions } from '@/hooks/useCsvActions';

const publishMock = jest.fn();
const downloadCsvFileMock = jest.fn();
const isCsvFileMock = jest.fn();

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('@/utils/csv', () => ({
  downloadCsvFile: (...args: unknown[]) => downloadCsvFileMock(...args),
  isCsvFile: (...args: unknown[]) => isCsvFileMock(...args),
}));

describe('useCsvActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isCsvFileMock.mockReturnValue(true);
  });

  it('should import csv and reload list on success', async () => {
    const importCsv = jest.fn().mockResolvedValue({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });
    const exportCsv = jest.fn();
    const reloadList = jest.fn().mockResolvedValue(undefined);
    const csvFile = new File(['name\nExam'], 'exams.csv', { type: 'text/csv' });
    Object.defineProperty(csvFile, 'text', {
      value: jest.fn().mockResolvedValue('name\nExam'),
    });

    const { result } = renderHook(() =>
      useCsvActions({
        canManage: true,
        resourceLabel: 'exames',
        importCsv,
        exportCsv,
        reloadList,
      }),
    );

    await act(async () => {
      await result.current.importCsvFile(csvFile);
    });

    expect(importCsv).toHaveBeenCalledWith('name\nExam');
    expect(reloadList).toHaveBeenCalledTimes(1);
    expect(publishMock).toHaveBeenCalledWith(
      'success',
      expect.stringContaining('Importação de exames concluída.'),
    );
  });

  it('should block csv import when file is invalid', async () => {
    isCsvFileMock.mockReturnValue(false);
    const importCsv = jest.fn();
    const exportCsv = jest.fn();
    const reloadList = jest.fn();
    const invalidFile = new File(['content'], 'invalid.txt', { type: 'text/plain' });
    Object.defineProperty(invalidFile, 'text', {
      value: jest.fn().mockResolvedValue('content'),
    });

    const { result } = renderHook(() =>
      useCsvActions({
        canManage: true,
        resourceLabel: 'exames',
        importCsv,
        exportCsv,
        reloadList,
      }),
    );

    await act(async () => {
      await result.current.importCsvFile(invalidFile);
    });

    expect(importCsv).not.toHaveBeenCalled();
    expect(publishMock).toHaveBeenCalledWith('error', 'Selecione um arquivo CSV válido.');
  });

  it('should export csv and trigger browser download', async () => {
    const importCsv = jest.fn();
    const exportCsv = jest.fn().mockResolvedValue({
      fileName: 'users.csv',
      csvContent: 'fullName,email',
    });
    const reloadList = jest.fn();

    const { result } = renderHook(() =>
      useCsvActions({
        canManage: true,
        resourceLabel: 'usuários',
        importCsv,
        exportCsv,
        reloadList,
      }),
    );

    await act(async () => {
      await result.current.exportCsvFile();
    });

    expect(exportCsv).toHaveBeenCalledTimes(1);
    expect(downloadCsvFileMock).toHaveBeenCalledWith('users.csv', 'fullName,email');
    expect(publishMock).toHaveBeenCalledWith('success', 'Exportação de usuários concluída.');
  });

  it('should ignore csv actions when user cannot manage the resource', async () => {
    const importCsv = jest.fn();
    const exportCsv = jest.fn();
    const reloadList = jest.fn();
    const csvFile = new File(['name\nExam'], 'exams.csv', { type: 'text/csv' });
    Object.defineProperty(csvFile, 'text', {
      value: jest.fn().mockResolvedValue('name\nExam'),
    });

    const { result } = renderHook(() =>
      useCsvActions({
        canManage: false,
        resourceLabel: 'exames',
        importCsv,
        exportCsv,
        reloadList,
      }),
    );

    await act(async () => {
      await result.current.importCsvFile(csvFile);
      await result.current.exportCsvFile();
    });

    expect(importCsv).not.toHaveBeenCalled();
    expect(exportCsv).not.toHaveBeenCalled();
    expect(reloadList).not.toHaveBeenCalled();
  });
});
