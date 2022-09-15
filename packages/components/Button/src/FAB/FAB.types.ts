import { ButtonSlotProps, ButtonCoreTokens, ButtonCoreProps } from '../Button.types';
import { ShadowProps } from '@fluentui-react-native/experimental-shadow';

export const fabName = 'FAB';

export interface FABSlotProps extends ButtonSlotProps {
  shadow?: ShadowProps;
}

export interface FABProps extends ButtonCoreProps {
  showChildren?: boolean;
}

export interface FABType {
  props: FABProps;
  tokens: ButtonCoreTokens;
  slotProps: FABSlotProps;
}
