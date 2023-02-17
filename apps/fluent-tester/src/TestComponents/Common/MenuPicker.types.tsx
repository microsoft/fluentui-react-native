export interface CollectionItem<T = string> {
  label: string;
  value?: T;
  testID?: string;
}

export interface MenuPickerProps {
  prompt?: string;
  selected?: string;
  onChange?: (value: any, index?: number) => void;
  collection?: CollectionItem[];
  style?: any;
  testID?: string;
}
