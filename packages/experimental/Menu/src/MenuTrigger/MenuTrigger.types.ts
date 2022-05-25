import { InteractionEvent, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { ViewProps } from 'react-native';

export const menuTriggerName = 'MenuTrigger';

export interface MenuTriggerProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /**
   * A RefObject to refer to the trigger component.
   */
  componentRef?: React.RefObject<React.Component>;

  onClick?: (e: InteractionEvent) => void;
}

export interface MenuTriggerState {
  props: MenuTriggerProps;
  isSubmenu: boolean;
}
