import type { ColorValue, View } from 'react-native';

import type { OwnedRootProps, PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { FontIconSource } from '../icon/icon.types';

export type CheckboxIndicatorStatus = 'unchecked' | 'checked' | 'indeterminate';

export type CheckboxIndicatorProps = OwnedRootProps<PropsWithRefOf<typeof View>, 'accessible'> & {
  checkedIconSource?: FontIconSource;
  iconColor?: ColorValue;
  iconSize?: number;
  indeterminateIconSource?: FontIconSource;
  status?: CheckboxIndicatorStatus;
};
