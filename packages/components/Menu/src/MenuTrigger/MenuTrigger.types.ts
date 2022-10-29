import { InteractionEvent, PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';

export const menuTriggerName = 'MenuTrigger';

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
