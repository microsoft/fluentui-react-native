export const parseISOString = (dateISOString: string): Date => {
  if (dateISOString == null) {
    return null;
  }
  const dateParts: number[] = dateISOString.split(/\D+/).map((x) => parseInt(x, 10));
  dateParts[1]--; // Date.UTC's `month` arg is zero-based
  const dateUTC = Date.UTC.apply(null, dateParts);
  return new Date(dateUTC);
};
