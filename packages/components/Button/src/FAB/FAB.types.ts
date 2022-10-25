import { ButtonSlotProps, ButtonCoreTokens, ButtonCoreProps } from '../Button.types';
import { ShadowProps } from '@fluentui-react-native/experimental-shadow';
import { PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';

export const fabName = 'FAB';

export interface FABSlotProps extends ButtonSlotProps {
  shadow?: ShadowProps;
  ripple?: { children: React.PropsWithRef<PressablePropsExtended> }; // Is this valid?
}

export interface FABProps extends ButtonCoreProps {
  showContent?: boolean;
}

export interface FABType {
  props: FABProps;
  tokens: ButtonCoreTokens;
  slotProps: FABSlotProps;
}
