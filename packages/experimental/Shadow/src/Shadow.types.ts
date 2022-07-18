import { ShadowToken } from '@fluentui-react-native/theme-types';
import { ViewProps } from 'react-native';

export const shadowName = 'Shadow';

export interface ShadowProps extends ViewProps {
  shadowToken?: ShadowToken;
}
