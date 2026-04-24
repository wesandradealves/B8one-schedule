import { fireEvent, render, screen } from '@testing-library/react';
import { ListCsvControls } from '@/components/molecules/list-csv-controls';

describe('ListCsvControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open file picker and dispatch selected csv file for import', async () => {
    const onImportCsv = jest.fn().mockResolvedValue(undefined);
    const onExportCsv = jest.fn().mockResolvedValue(undefined);

    render(
      <ListCsvControls
        isExporting={false}
        isImporting={false}
        resourceLabel="exames"
        onExportCsv={onExportCsv}
        onImportCsv={onImportCsv}
      />,
    );

    const input = screen.getByLabelText('Importar CSV de exames') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click');
    fireEvent.click(screen.getByRole('button', { name: 'Importar CSV' }));
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const csvFile = new File(['name\nExam'], 'exams.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [csvFile] } });

    await Promise.resolve();
    expect(onImportCsv).toHaveBeenCalledWith(csvFile);
  });

  it('should dispatch export action', async () => {
    const onImportCsv = jest.fn().mockResolvedValue(undefined);
    const onExportCsv = jest.fn().mockResolvedValue(undefined);

    render(
      <ListCsvControls
        isExporting={false}
        isImporting={false}
        resourceLabel="usuários"
        onExportCsv={onExportCsv}
        onImportCsv={onImportCsv}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    await Promise.resolve();

    expect(onExportCsv).toHaveBeenCalledTimes(1);
  });
});
