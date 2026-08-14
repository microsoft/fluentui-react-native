import type { ColorValue, ViewProps } from 'react-native';

import type { OwnedRootProps } from '@fluentui-react-native/framework-base';
import type { FontIconSource } from '../icon/icon.types';

export type CheckboxIndicatorStatus = 'unchecked' | 'checked' | 'indeterminate';

export type CheckboxIndicatorProps = OwnedRootProps<ViewProps, 'accessible'> & {
  checkedIconSource?: FontIconSource;
  iconColor?: ColorValue;
  iconSize?: number;
  indeterminateIconSource?: FontIconSource;
  status?: CheckboxIndicatorStatus;
};
