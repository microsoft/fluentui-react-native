import { ButtonSlotProps, ButtonCoreTokens, ButtonCorePropsWithInnerRef } from '../Button.types';

export const fabName = 'FAB';

export interface FABType {
  props: ButtonCorePropsWithInnerRef;
  tokens: ButtonCoreTokens;
  slotProps: ButtonSlotProps;
}
