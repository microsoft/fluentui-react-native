import { StyleSheet } from 'react-native';

import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';

import { cardStyles, getCardChrome } from './card.styles';
import type { CardState } from './card.types';

/**
 * Applies stable theme styles and instance-specific style selections to the Card slots.
 */
export function useCardStyles_unstable(state: CardState) {
  const chrome = getCardChrome(state);
  const rootStyle = [cardStyles.root, chrome.root, state.userStyle];
  const { borderRadius, padding } = StyleSheet.flatten(rootStyle);

  applyFocusRingStyles(state.FocusRing, state, borderRadius);
  attachSlotProps(state.root, { style: rootStyle });

  if (state.overlay) {
    attachSlotProps(state.overlay, {
      accessible: true,
      style: [cardStyles.overlay, { borderRadius }],
    });
  }

  if (state.header) {
    attachSlotDefaults(state.header, { style: cardStyles.section });
  }

  if (state.content) {
    attachSlotDefaults(state.content, { style: cardStyles.section });
  }

  if (state.content02) {
    const nestedRadius = Math.max(0, (typeof borderRadius === 'number' ? borderRadius : 0) - (typeof padding === 'number' ? padding : 0));
    attachSlotDefaults(state.content02, {
      style: [cardStyles.section, cardStyles.nestedContent, chrome.nestedContent, { borderRadius: nestedRadius }],
    });
  }

  if (state.footer) {
    attachSlotDefaults(state.footer, { style: cardStyles.section });
  }
}
