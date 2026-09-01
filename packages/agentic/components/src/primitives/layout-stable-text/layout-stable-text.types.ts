import type * as React from 'react';
import type { TextProps, View } from 'react-native';

import type { OwnedRootProps, PropsWithRefOf } from '@fluentui-react-native/framework-base';

export type LayoutStableTextProps = OwnedRootProps<PropsWithRefOf<typeof View>, 'accessible'> & {
  /**
   * The hidden text element whose metrics reserve enough space for every visual state.
   */
  reserve: React.ReactElement<TextProps>;
  /**
   * The visible text element rendered over the reserved metrics.
   */
  visible: React.ReactElement<TextProps>;
};
