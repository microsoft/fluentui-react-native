/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { sliderStyles } from './slider.styles';
import type { SliderState } from './slider.types';

export function renderSlider_unstable(state: SliderState) {
  const Target = state.Target;
  const vertical = state.orientation === 'vertical';
  const edge = (fraction: number): ViewStyle => (vertical ? { bottom: `${fraction * 100}%` } : { start: `${fraction * 100}%` });
  const size = state.targetSize ?? 28;
  const center: ViewStyle = vertical ? { marginBottom: -size / 2 } : { marginStart: -size / 2 };
  return (
    <state.root>
      <state.input>
        <state.rail>
          <state.track />
          {state.marks.map((mark) => (
            <View key={mark} {...hiddenFromAccessibilityProps} style={[sliderStyles.layer, state.markStyle, edge(mark)]} />
          ))}
        </state.rail>
        {state.segments.map((segment) => (
          <View
            key={segment.thumb}
            pointerEvents="box-none"
            style={[
              sliderStyles.layer,
              sliderStyles.thumb,
              { width: size, height: size, zIndex: segment.active ? 1 : 0 },
              center,
              edge(segment.fraction),
            ]}
          >
            <View {...hiddenFromAccessibilityProps} pointerEvents="none" style={state.thumbStyle} />
            <Target {...segment.native} pointerEvents="none" style={sliderStyles.nativeTarget} />
          </View>
        ))}
      </state.input>
    </state.root>
  );
}
