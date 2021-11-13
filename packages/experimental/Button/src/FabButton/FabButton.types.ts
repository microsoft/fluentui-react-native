import { ButtonSlotProps, ButtonCoreTokens, ButtonCoreProps } from '../Button.types';

export const fabButtonName = 'FabButton';

export interface FabButtonType {
  props: ButtonCoreProps;
  tokens: ButtonCoreTokens;
  slotProps: ButtonSlotProps;
}
