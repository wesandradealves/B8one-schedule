'use client';

import { useCallback, useMemo, useState } from 'react';
import { useFeedback } from '@/hooks/useFeedback';
import type { CsvExportResult, CsvImportResult } from '@/types/api';
import { downloadCsvFile, isCsvFile } from '@/utils/csv';
import { getRequestErrorMessage } from '@/utils/request';

interface UseCsvActionsInput {
  canManage: boolean;
  resourceLabel: string;
  importCsv: (csvContent: string) => Promise<CsvImportResult>;
  exportCsv: () => Promise<CsvExportResult>;
  reloadList: () => Promise<void>;
}

const buildImportSummaryMessage = (
  resourceLabel: string,
  result: CsvImportResult,
): string => {
  return (
    `Importação de ${resourceLabel} concluída. ` +
    `Processadas: ${result.processedRows}. ` +
    `Criadas: ${result.createdRows}. ` +
    `Atualizadas: ${result.updatedRows}. ` +
    `Ignoradas: ${result.skippedRows}.`
  );
};

export const useCsvActions = ({
  canManage,
  resourceLabel,
  importCsv,
  exportCsv,
  reloadList,
}: UseCsvActionsInput) => {
  const { publish } = useFeedback();
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const importCsvFile = useCallback(
    async (file: File | null) => {
      if (!canManage || !file) {
        return;
      }

      if (!isCsvFile(file)) {
        publish('error', 'Selecione um arquivo CSV válido.');
        return;
      }

      setIsImportingCsv(true);

      try {
        const csvContent = await file.text();
        const importResult = await importCsv(csvContent);

        publish('success', buildImportSummaryMessage(resourceLabel, importResult));

        if (importResult.errors.length > 0) {
          publish(
            'warning',
            `A importação de ${resourceLabel} teve ${importResult.errors.length} linha(s) com erro.`,
          );
        }

        await reloadList();
      } catch (error) {
        publish('error', getRequestErrorMessage(error));
      } finally {
        setIsImportingCsv(false);
      }
    },
    [canManage, importCsv, publish, reloadList, resourceLabel],
  );

  const exportCsvFile = useCallback(async () => {
    if (!canManage) {
      return;
    }

    setIsExportingCsv(true);

    try {
      const exportResult = await exportCsv();
      downloadCsvFile(exportResult.fileName, exportResult.csvContent);
      publish('success', `Exportação de ${resourceLabel} concluída.`);
    } catch (error) {
      publish('error', getRequestErrorMessage(error));
    } finally {
      setIsExportingCsv(false);
    }
  }, [canManage, exportCsv, publish, resourceLabel]);

  const isCsvBusy = useMemo(() => isImportingCsv || isExportingCsv, [isExportingCsv, isImportingCsv]);

  return {
    isImportingCsv,
    isExportingCsv,
    isCsvBusy,
    importCsvFile,
    exportCsvFile,
  };
};
