export const isCsvFile = (file: File): boolean => {
  const lowerCaseName = file.name.toLowerCase();
  const lowerCaseType = file.type.toLowerCase();

  return (
    lowerCaseName.endsWith('.csv') ||
    lowerCaseType === 'text/csv' ||
    lowerCaseType === 'application/vnd.ms-excel'
  );
};

export const downloadCsvFile = (fileName: string, csvContent: string): void => {
  const csvBlob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const blobUrl = URL.createObjectURL(csvBlob);
  const downloadLink = document.createElement('a');

  downloadLink.href = blobUrl;
  downloadLink.download = fileName;
  downloadLink.click();

  URL.revokeObjectURL(blobUrl);
};
