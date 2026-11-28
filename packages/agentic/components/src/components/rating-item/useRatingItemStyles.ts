import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { ratingItemStyles, resolveRatingItemChrome } from './rating-item.styles';
import type { RatingItemState } from './rating-item.types';

export function useRatingItemStyles(state: RatingItemState) {
  const chrome = resolveRatingItemChrome(state);
  attachSlotProps(state.root, { style: [ratingItemStyles.root, chrome.root] });
  attachSlotProps(state.frame, { style: chrome.frame });
  attachSlotProps(state.base, chrome.base);
  if (state.mask && state.overlay) {
    attachSlotProps(state.mask, { style: [ratingItemStyles.mask, chrome.mask] });
    attachSlotProps(state.overlay, chrome.overlay);
  }
}
