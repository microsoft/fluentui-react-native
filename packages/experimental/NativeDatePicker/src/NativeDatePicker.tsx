export const NativeDatePicker = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  present: (params: any) => {
    console.warn('This log should not appear');
    params;
  },
  parseISOString: (date: string) => {
    console.warn('This log should not appear');
    return new Date(date)
  },
};
