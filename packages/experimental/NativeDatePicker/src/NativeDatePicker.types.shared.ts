export type DatePickerSharedParameterObject = {
  startDate?: Date;
  endDate?: Date;
  callback: (startDate: string, endDate: string) => void
}

export type NativeDatePickerSharedInterface = {
  parseISOString(dateISOString: string): Date;
}