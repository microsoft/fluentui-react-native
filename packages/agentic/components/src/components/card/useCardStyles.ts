import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';

import {
  cardStyles,
  getCardBackgroundStyle,
  getCardNestedBlockStyle,
  getCardOverlayStyle,
  getCardRootStyle,
  getCardStrokeStyle,
} from './card.styles';
import type { CardState } from './card.types';

/**
 * Applies stable theme styles and instance-specific style selections to the Card slots.
 */
export function useCardStyles_unstable(state: CardState) {
  const rootStyle: StyleProp<ViewStyle> = [
    cardStyles.root,
    getCardRootStyle(state),
    getCardBackgroundStyle(state),
    getCardStrokeStyle(state),
    state.userStyle,
  ];
  const overlayStyle = getCardOverlayStyle(state);

  applyFocusRingStyles(state.FocusRing, state, overlayStyle.borderRadius);
  attachSlotProps(state.root, { style: rootStyle });

  if (state.overlay) {
    attachSlotProps(state.overlay, {
      accessible: true,
      style: [cardStyles.overlay, overlayStyle],
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
