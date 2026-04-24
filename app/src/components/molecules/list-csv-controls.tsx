'use client';

import { useCallback, useRef, type ChangeEvent } from 'react';
import styled from 'styled-components';
import { ListActionButton } from '@/components/atoms/list-action-button';

const CsvControlsWrapper = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

interface ListCsvControlsProps {
  resourceLabel: string;
  isDisabled?: boolean;
  isImporting: boolean;
  isExporting: boolean;
  onImportCsv: (file: File | null) => Promise<void>;
  onExportCsv: () => Promise<void>;
}

export function ListCsvControls({
  resourceLabel,
  isDisabled = false,
  isImporting,
  isExporting,
  onImportCsv,
  onExportCsv,
}: ListCsvControlsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCsvSelection = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0] ?? null;
      await onImportCsv(selectedFile);
      event.target.value = '';
    },
    [onImportCsv],
  );

  return (
    <CsvControlsWrapper>
      <input
        ref={fileInputRef}
        accept=".csv,text/csv"
        aria-label={`Importar CSV de ${resourceLabel}`}
        className="sr-only"
        type="file"
        onChange={(event) => {
          void handleCsvSelection(event);
        }}
      />

      <ListActionButton
        disabled={isDisabled || isImporting || isExporting}
        variant="edit"
        onClick={openFilePicker}
      >
        {isImporting ? 'Importando...' : 'Importar CSV'}
      </ListActionButton>

      <ListActionButton
        disabled={isDisabled || isImporting || isExporting}
        variant="save"
        onClick={() => {
          void onExportCsv();
        }}
      >
        {isExporting ? 'Exportando...' : 'Exportar CSV'}
      </ListActionButton>
    </CsvControlsWrapper>
  );
}
