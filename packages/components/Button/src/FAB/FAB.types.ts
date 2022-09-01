import { ButtonSlotProps, ButtonCoreTokens, ButtonCoreProps } from '../Button.types';
import { ShadowProps } from '@fluentui-react-native/experimental-shadow';

export const fabName = 'FAB';

export interface FABSlotProps extends ButtonSlotProps {
  shadow?: ShadowProps;
}
export interface FABType {
  props: ButtonCoreProps;
  tokens: ButtonCoreTokens;
  slotProps: FABSlotProps;
}
