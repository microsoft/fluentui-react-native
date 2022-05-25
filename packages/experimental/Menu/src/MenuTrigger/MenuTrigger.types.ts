import { InteractionEvent, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { ViewProps } from 'react-native';

export const menuTriggerName = 'MenuTrigger';

export interface MenuTriggerProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /**
   * A RefObject to refer to the trigger component.
   */
  componentRef?: React.RefObject<React.Component>;

  /**
   * A callback to call on button click event
   */
  onClick?: (e: InteractionEvent) => void;
}

export type MenuTriggerState = MenuTriggerProps;
