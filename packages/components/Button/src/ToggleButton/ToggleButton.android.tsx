/** @jsx withSlots */
import { View } from 'react-native';
import { toggleButtonName, ToggleButtonType } from './ToggleButton.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { compose } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';

export const ToggleButton = compose<ToggleButtonType>({
  displayName: toggleButtonName,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
  },
  useRender: () => {
    return () => {
      console.warn('Toggle Button is not implemented for Android');
      return null;
    };
  },
});
