/** @jsxImportSource @fluentui-react-native/framework-base */
import { View, type ViewProps } from 'react-native';

import { compose } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import type { CompoundButtonSlotProps, CompoundButtonType } from './CompoundButton.types';
import { compoundButtonName } from './CompoundButton.types';

export interface MobileSlotProps extends CompoundButtonSlotProps {
  root: ViewProps;
}
export interface CompoundButtonMobileType extends CompoundButtonType {
  slotProps: MobileSlotProps;
}

export const CompoundButton = compose<CompoundButtonMobileType>({
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
      console.warn('Compound Button is not implemented on Android/iOS');
      return null;
    };
  },
});
