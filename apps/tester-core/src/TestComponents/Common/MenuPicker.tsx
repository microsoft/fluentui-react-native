import type { CollectionItem, MenuPickerProps } from './MenuPicker.types';
export type { CollectionItem, MenuPickerProps };

/*
 * The MenuPicker was created because the RN Core Picker was deprecated (preventing us from updating to RN 0.66).
 */

export const MenuPicker: React.FunctionComponent<MenuPickerProps> = (_props: MenuPickerProps) => {
  console.warn('Platform not supported');
  return null;
};
