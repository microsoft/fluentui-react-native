import type { ViewProps } from 'react-native';

import type { ShadowToken } from '@fluentui-react-native/theme-types';

export const shadowName = 'Shadow';

export interface ShadowProps extends ViewProps {
  shadowToken?: ShadowToken;
}
