import type * as React from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import type { OwnedRootProps } from '@fluentui-react-native/framework-base';
import type { ItemSecondaryContentPosition } from '../../common/item.types';

export type CompoundItemLayoutProps = OwnedRootProps<ViewProps> & {
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
