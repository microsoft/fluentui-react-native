import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { ButtonSlotProps, ButtonTokens, ButtonProps } from '../Button.types';

export const compoundButtonName = 'CompoundButton';

export type CompoundButtonTokens = ButtonTokens;

export interface CompoundButtonProps extends ButtonProps {
  secondaryContent?: string;
}

export interface CompoundButtonSlotProps extends ButtonSlotProps {
  contentContainer: ViewProps;
  secondaryContent: TextProps;
}

export interface CompoundButtonType {
  props: CompoundButtonProps;
  tokens: CompoundButtonTokens;
  slotProps: CompoundButtonSlotProps;
}
