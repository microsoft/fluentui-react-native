/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { RatingItem } from '../rating-item/rating-item';
import type { RatingState } from './rating.types';

export function renderRating_unstable(state: RatingState) {
  return (
    <state.root>
      <state.input>
        {state.stars.map((fill, index) => (
          <View key={index} {...hiddenFromAccessibilityProps} pointerEvents="none">
            <RatingItem fill={fill} size={state.size} disabled={state.disabled} />
          </View>
        ))}
        <state.target />
      </state.input>
    </state.root>
  );
}
