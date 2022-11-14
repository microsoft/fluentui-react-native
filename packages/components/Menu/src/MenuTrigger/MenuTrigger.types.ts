import * as React from 'react';
import { InteractionEvent, PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';

export const menuTriggerName = 'MenuTrigger';

/**
 * Represents single react element (or null), which is the
 * type of the child of MenuTrigger. Notably this excludes string, number,
 * and array of elements as children, which MenuTrigger doesn't support.
 */
type SingleReactElement = React.ReactElement | null;

export interface MenuTriggerProps {
  children?: SingleReactElement;
}

export interface MenuTriggerChildProps extends Omit<PressablePropsExtended, 'onPress'> {
  /**
   * A RefObject to refer to the trigger component.
   */
  componentRef?: React.RefObject<React.Component>;

  /**
   * A callback to call on button click event
   */
  onClick?: (e: InteractionEvent) => void;
}

export interface MenuTriggerState {
  props: MenuTriggerChildProps;
  hasSubmenu: boolean;
}
