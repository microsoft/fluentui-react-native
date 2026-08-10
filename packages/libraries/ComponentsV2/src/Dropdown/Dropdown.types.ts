import type * as React from 'react';

import type {InteractionEvent} from '@fluentui/react-native';

export type DropdownAppearance = 'outline' | 'underline' | 'filled-darker' | 'filled-lighter';
export type DropdownSize = 'small' | 'medium' | 'large';

export interface DropdownOptionSelectData {
  optionText?: string;
  optionValue?: string;
  selectedOptions: string[];
}

export interface DropdownProps {
  appearance?: DropdownAppearance;
  children?: React.ReactNode;
  clearable?: boolean;
  defaultOpen?: boolean;
  defaultSelectedOptions?: string[];
  disabled?: boolean;
  multiselect?: boolean;
  onOpenChange?: (event: InteractionEvent, data: {open: boolean}) => void;
  onOptionSelect?: (event: InteractionEvent, data: DropdownOptionSelectData) => void;
  open?: boolean;
  placeholder?: string;
  selectedOptions?: string[];
  size?: DropdownSize;
}

export interface DropdownOptionProps {
  children?: React.ReactNode;
  disabled?: boolean;
  text?: string;
  value: string;
}
