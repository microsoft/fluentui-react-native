import { InteractionEvent, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { ViewProps } from 'react-native';

export const menuTriggerName = 'MenuTrigger';

export interface MenuTriggerProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<React.Component>;

  onClick?: (e: InteractionEvent) => void;
}

export interface MenuTriggerState {
  props: MenuTriggerProps;
  isSubmenu: boolean;
}
