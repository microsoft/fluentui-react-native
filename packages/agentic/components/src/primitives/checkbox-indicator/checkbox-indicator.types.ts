import type { ColorValue, View } from 'react-native';

import type { OwnedRootProps, PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { SvgIconSource } from '../icon/icon.types';

export type CheckboxIndicatorStatus = 'unchecked' | 'checked' | 'indeterminate';

export type CheckboxIndicatorProps = OwnedRootProps<PropsWithRefOf<typeof View>, 'accessible'> & {
  checkedIconSource?: SvgIconSource;
  iconColor?: ColorValue;
  iconSize?: number;
  indeterminateIconSource?: SvgIconSource;
  status?: CheckboxIndicatorStatus;
};
