import type React from 'react';
import type { ViewProps } from 'react-native';

import type { ShadowToken } from '@fluentui-react-native/design/theming';

export const shadowName = 'Shadow';

export interface ShadowProps extends ViewProps {
  shadowToken?: ShadowToken;

  /** Exactly one child */
  children: React.ReactElement;
}
