/** @jsxImportSource @fluentui-react-native/framework-base */
import { View, type ViewProps } from 'react-native';

import { compose } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import type { ToggleButtonSlotProps, ToggleButtonType } from './ToggleButton.types';
import { toggleButtonName } from './ToggleButton.types';

interface ToggleButtonSlotPropsAndroid extends ToggleButtonSlotProps {
  root: ViewProps;
}

interface ToggleButtonAndroidType extends ToggleButtonType {
  slotProps: ToggleButtonSlotPropsAndroid;
}

export const ToggleButton = compose<ToggleButtonAndroidType>({
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
