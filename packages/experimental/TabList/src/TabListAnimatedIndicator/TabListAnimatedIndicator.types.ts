import type { ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';

export const tablistAnimatedIndicatorName = 'TabListAnimatedIndicator';

export interface TabListAnimatedIndicatorProps extends IViewProps {
  vertical?: boolean;
  styles?: {
    container: ViewStyle;
    indicator: ViewStyle;
  };
}
