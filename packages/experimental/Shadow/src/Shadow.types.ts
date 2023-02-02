import type { ShadowToken } from '@fluentui-react-native/theme-types';
import type { ViewProps } from 'react-native';

export const shadowName = 'Shadow';

export interface ShadowProps extends ViewProps {
  shadowToken?: ShadowToken;
}
