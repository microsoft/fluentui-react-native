/** @jsxImportSource @fluentui-react-native/framework-base */
import { RatingItem } from '../rating-item/rating-item';
import type { RatingDisplayState } from './rating-display.types';

export function renderRatingDisplay_unstable(state: RatingDisplayState) {
  if (!state.value) return null;
  return (
    <state.root>
      {state.stars && (
        <state.stars>
          {state.fills.map((fill, scalePosition) => (
            <RatingItem key={scalePosition} fill={fill} size={state.size} />
          ))}
        </state.stars>
      )}
      <state.value />
      {state.count && <state.count />}
    </state.root>
  );
}
