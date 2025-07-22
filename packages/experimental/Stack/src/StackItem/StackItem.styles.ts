import type { ViewStyle, ViewProps } from 'react-native';

import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { getTypedMemoCache } from '@fluentui-react-native/framework';

import { stackItemName } from './StackItem.types';
import type { StackItemTokens, StackItemProps, StackItemSlotProps } from './StackItem.types';

// styles are keyed on token values and are independent of themes or variants so just use a common cache
const localCache = getTypedMemoCache<ViewProps>();

const alignMap: { [key: string]: ViewStyle['alignSelf'] } = {
  start: 'flex-start',
  end: 'flex-end',
};

export const stylingSettings: UseStylingOptions<StackItemProps, StackItemSlotProps, StackItemTokens> = {
  /** no real defaults, just look up the name in the settings in case someone decides to set them */
  tokens: [stackItemName],
  /** all tokens are also props, so just copy props onto tokens */
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: (tokenProps: StackItemTokens) => {
      const { grow, shrink, disableShrink, align, verticalFill, margin } = tokenProps;
      return localCache(
        () => ({
          style: {
            width: 'auto',
            margin,
            height: verticalFill ? '100%' : 'auto',
            flexShrink: disableShrink || (!grow && !shrink) ? 0 : 1,
            flexGrow: typeof grow === 'number' ? grow : grow ? 1 : undefined,
            alignSelf: (align && alignMap[align]) || undefined,
          },
        }),
        [grow, shrink, disableShrink, align, verticalFill, margin],
      )[0];
    },
  },
};
