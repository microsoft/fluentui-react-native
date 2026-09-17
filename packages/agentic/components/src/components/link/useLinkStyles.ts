import type { StyleProp, TextStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  getLinkDecorationStyle,
  getLinkForegroundStyle,
  getLinkIconMetrics,
  getLinkRootStyle,
  getLinkTypographyStyle,
  linkStyles,
} from './link.styles';
import type { LinkState } from './link.types';

export function useLinkStyles_unstable(state: LinkState): void {
  const { inline, userStyle } = state;
  const foreground = getLinkForegroundStyle(state);
  const rootStyle: StyleProp<TextStyle> = [linkStyles.root, getLinkRootStyle(state), userStyle];

  // The typography entry is omitted rather than blanked so an inline link inherits family, size, weight,
  // and line height from the text run it sits in.
  const contentStyle: StyleProp<TextStyle> = inline
    ? [getLinkDecorationStyle(state), foreground]
    : [getLinkTypographyStyle(state), getLinkDecorationStyle(state), foreground];

  attachSlotProps(state.root, { style: rootStyle });
  if (state.content) {
    attachSlotProps(state.content, { style: contentStyle });
  }
  if (state.icon) {
    const { height, width } = getLinkIconMetrics(state.tokens);
    attachSlotProps(state.icon, {
      accessible: false,
      color: foreground.color,
      height,
      width,
    });
  }
}
