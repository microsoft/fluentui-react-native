import type { ComboboxSize } from './Combobox.types';

export interface ComboboxSizeTokens {
  fontSize: number;
  height: number;
  iconSize: number;
  paddingLeft: number;
  paddingRight: number;
}

export const comboboxSizeTokens: Readonly<Record<ComboboxSize, ComboboxSizeTokens>> = {
  small: {
    fontSize: 12,
    height: 24,
    iconSize: 16,
    paddingLeft: 8,
    paddingRight: 6,
  },
  medium: {
    fontSize: 14,
    height: 32,
    iconSize: 20,
    paddingLeft: 10,
    paddingRight: 8,
  },
  large: {
    fontSize: 16,
    height: 40,
    iconSize: 24,
    paddingLeft: 14,
    paddingRight: 12,
  },
};
