/** @jsxImportSource @fluentui-react-native/framework-base */
import type { RatingItemState } from './rating-item.types';

export function renderRatingItem(state: RatingItemState) {
  return (
    <state.root>
      <state.frame>
        <state.base />
        {state.mask && state.overlay && (
          <state.mask>
            <state.overlay />
          </state.mask>
        )}
      </state.frame>
    </state.root>
  );
}
