export const NativeDatePicker = {
  present: (params: any) => {
    console.log("SHOULD NOT LOG" + params);
  },
  parseISOString: (date: string) => new Date(date),
};
console.warn('DatePicker not supported');
