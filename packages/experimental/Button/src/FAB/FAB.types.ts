import { ButtonSlotProps, ButtonCoreTokens, ButtonComposedCoreProps } from '../Button.types';

export const fabName = 'FAB';

export interface FABType {
  props: ButtonComposedCoreProps;
  tokens: ButtonCoreTokens;
  slotProps: ButtonSlotProps;
}
