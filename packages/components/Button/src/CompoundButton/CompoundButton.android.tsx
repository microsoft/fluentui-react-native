/** @jsx withSlots */
import { View } from 'react-native';
import { compoundButtonName, CompoundButtonType } from './CompoundButton.types';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { compose } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';

export const CompoundButton = compose<CompoundButtonType>({
  displayName: compoundButtonName,
  slots: {
    root: View,
    icon: Icon,
    content: Text,
    secondaryContent: Text,
    contentContainer: View,
  },
  useRender: () => {
    return () => {
      console.warn('Compound Button is not implemented for Android');
      return null;
    };
  },
});
