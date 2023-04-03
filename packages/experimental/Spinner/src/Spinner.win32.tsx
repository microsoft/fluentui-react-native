/** @jsx withSlots */
import type { ColorValue } from 'react-native';
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Path, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

import { RCTNativeAnimatedSpinner } from './consts.win32';
import { diameterSizeMap, lineThicknessSizeMap, stylingSettings } from './Spinner.styling.win32';
import { spinnerName } from './Spinner.types';
import type { SpinnerProps, SpinnerType, SpinnerSvgProps } from './Spinner.types.win32';

// TODO: getTailPath, tailSvg

const getTrackPath = (diameter: number, width: number, color: ColorValue) => {
  const start = {
    x: width / 2,
    y: diameter / 2 + width / 2,
  };

  const path = `M${start.x} ${start.y} a${diameter / 2} ${diameter / 2} 0 1 0 ${diameter} 0 a${diameter / 2} ${
    diameter / 2
  } 0 1 0 -${diameter} 0}`;
  return <Path d={path} stroke={color} strokeWidth={width} strokeLinecap="round" fillOpacity={0} />;
};

/* Track is a full circle with a transparent fill */
const trackSvg: React.FunctionComponent<SpinnerSvgProps> = (props: SpinnerSvgProps) => {
  const { size, trackColor, viewBoxHeight, viewBoxWidth } = props;
  const svgProps: SvgProps = {
    style: { height: viewBoxHeight, width: viewBoxWidth },
  };
  const path = getTrackPath(diameterSizeMap[size] - lineThicknessSizeMap[size], lineThicknessSizeMap[size], trackColor);

  return <Svg {...svgProps}>{path}</Svg>;
};

export const spinnerLookup = (layer: string, userProps: SpinnerProps): boolean => {
  return layer === userProps['appearance'];
};

export const Spinner = compose<SpinnerType>({
  displayName: spinnerName,
  ...stylingSettings,
  slots: {
    root: View,
    track: trackSvg,
    tail: Svg,
    tailContainer: RCTNativeAnimatedSpinner,
    label: Text,
  },
  useRender: (props: SpinnerProps, useSlots: UseSlots<SpinnerType>) => {
    const Slots = useSlots(props, (layer) => spinnerLookup(layer, props));

    return (rest: SpinnerProps) => {
      const { ...mergedProps } = mergeProps(props, rest);
      return (
        <Slots.root {...mergedProps}>
          <Slots.track viewBoxHeight={diameterSizeMap[props.size]} viewBoxWidth={diameterSizeMap[props.size]} />
        </Slots.root>
      );
    };
  },
});
