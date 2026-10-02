import type * as React from 'react';
import type { Pressable, View } from 'react-native';
import type { DistributiveOmit, FocusablePressableProps, Slot } from '@fluentui-react-native/framework-base';
import type { PopoverCompositionState, PopoverPosition, PopoverRootProps, PopoverTriggerProps } from '../popover/popover.types';
import type { MenuScope } from './menu.controller';

export type MenuPosition = PopoverPosition;
export type MenuTriggerProps = DistributiveOmit<PopoverTriggerProps, 'keyDownEvents' | 'keyUpEvents' | 'validKeysDown' | 'validKeysUp'> &
  Pick<FocusablePressableProps, 'onKeyDown' | 'onKeyUp'>;
export type MenuContentProps = Pick<
  React.ComponentPropsWithRef<typeof View>,
  'children' | 'ref' | 'style' | 'testID' | 'onLayout' | 'onTouchStart' | 'onTouchEnd'
>;
export type MenuSlots = {
  root: Slot<typeof View>;
  trigger: Slot<typeof Pressable>;
  content: Slot<typeof View>;
};
export type MenuStateProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  position?: MenuPosition;
  surfaceAccessibilityLabel: string;
};
export type MenuProps = MenuStateProps &
  PopoverRootProps & {
    trigger?: MenuTriggerProps;
    content?: MenuContentProps | null;
    accessibilityState?: import('react-native').AccessibilityState;
  };
export type MenuState = PopoverCompositionState & {
  scope: MenuScope;
  requestedOpen: boolean;
  contentUserStyle: MenuContentProps['style'];
};
