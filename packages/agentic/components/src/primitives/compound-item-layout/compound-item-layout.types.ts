import type * as React from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

import type { OwnedRootProps, PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { ItemSecondaryContentPosition } from '../../common/item.types';

export type CompoundItemLayoutProps = OwnedRootProps<PropsWithRefOf<typeof View>> & {
  contentStyle?: StyleProp<ViewStyle>;
  leading?: React.ReactNode;
  leadingStyle?: StyleProp<ViewStyle>;
  primary: React.ReactNode;
  primaryStyle?: StyleProp<ViewStyle>;
  secondary?: React.ReactNode;
  secondaryPosition?: ItemSecondaryContentPosition;
  secondaryStyle?: StyleProp<ViewStyle>;
  trailing?: React.ReactNode;
  trailingStyle?: StyleProp<ViewStyle>;
};
