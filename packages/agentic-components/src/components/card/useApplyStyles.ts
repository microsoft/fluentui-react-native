import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { cardStyles, getCardFocusStyle, getCardNestedBlockStyle, getCardOverlayStyle, getCardRootStyle, getCardSurfaceColors } from './card.styles';
import type { CardState } from './card.types';

/**
 * Applies stable theme styles and instance-specific style selections to the Card slots.
 */
export function useApplyStyles_unstable(state: CardState) {
  const colors = getCardSurfaceColors(state);
  const rootStyle: StyleProp<ViewStyle> = [cardStyles.root, getCardRootStyle(state), colors, state.userStyle];

  attachSlotProps(state.root, { style: rootStyle });

  if (state.overlay) {
    attachSlotProps(state.overlay, {
      accessible: true,
      focusable: state.isInteractive && !state.disabled,
      style: [cardStyles.overlay, getCardOverlayStyle(state), getCardFocusStyle(state)],
    });
  }

  if (state.header) {
    attachSlotProps(state.header, { style: cardStyles.section });
  }

  if (state.content) {
    attachSlotProps(state.content, { style: cardStyles.section });
  }

  if (state.content02) {
    attachSlotProps(state.content02, {
      style: [cardStyles.section, cardStyles.nestedContent, getCardNestedBlockStyle(state)],
    });
  }

  if (state.footer) {
    attachSlotProps(state.footer, { style: cardStyles.section });
  }
}
