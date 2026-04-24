const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const formatCurrencyFromCents = (valueInCents: number): string => {
  return currencyFormatter.format(valueInCents / 100);
};

export const formatDateTime = (value: string): string => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? '-' : dateTimeFormatter.format(parsedDate);
};

export const toDateInputValue = (value: string): string => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, 10);
};

export const toDateTimeLocalValue = (value: string): string => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const timezoneOffset = parsedDate.getTimezoneOffset() * 60000;
  const localDate = new Date(parsedDate.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
};
