/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ColorValue } from 'react-native';
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Path, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

import { stylingSettings } from './Spinner.styling.win32';
import { spinnerName } from './Spinner.types';
import type { SpinnerProps, SpinnerType, SpinnerSvgProps } from './Spinner.types.win32';
import { diameterSizeMap, lineThicknessSizeMap, getDefaultSize } from './SpinnerTokens.win32';
import { useSpinner } from './useSpinner';
import RCTNativeAnimatedContainer from './Win32NativeAnimatedContainerNativeComponent';

const getTrackPath = (diameter: number, width: number, color: ColorValue) => {
  const start = {
    x: width / 2,
    y: diameter / 2,
  };
  const innerRadius = diameter / 2 - width / 2;
  const path = `M${start.x} ${start.y} a${innerRadius} ${innerRadius} 0 1 0 ${innerRadius * 2} 0 a${innerRadius} ${innerRadius} 0 1 0 -${
    innerRadius * 2
  } 0}`;
  return <Path d={path} stroke={color} strokeWidth={width} strokeLinecap="round" fillOpacity={0} />;
};

/* Track is a full circle with a transparent fill */
const trackSvg: React.FunctionComponent<SpinnerSvgProps> = (props: SpinnerSvgProps) => {
  const { size, trackColor } = props;
  const svgProps: SvgProps = {
    style: {
      height: diameterSizeMap[size],
      width: diameterSizeMap[size],
    },
  };
  const path = getTrackPath(diameterSizeMap[size], lineThicknessSizeMap[size], trackColor);

  return <Svg {...svgProps}>{path}</Svg>;
};

const getTailPath = (diameter: number, width: number, color: ColorValue) => {
  const start = {
    x: diameter - width / 2,
    y: diameter / 2,
  };
  const innerRadius = diameter / 2 - width / 2;
  const path = `M${start.x} ${start.y} a${innerRadius} ${innerRadius} 0 0 0 -${innerRadius} -${innerRadius}`;

  return <Path d={path} stroke={color} strokeWidth={width} strokeLinecap="round" fillOpacity={0} />;
};

/* Track is a full circle with a transparent fill */
const tailSvg: React.FunctionComponent<SpinnerSvgProps> = (props: SpinnerSvgProps) => {
  const { size, tailColor } = props;
  const svgProps: SvgProps = {
    style: {
      height: diameterSizeMap[size],
      width: diameterSizeMap[size],
    },
  };
  const path = getTailPath(diameterSizeMap[size], lineThicknessSizeMap[size], tailColor);

  return <Svg {...svgProps}>{path}</Svg>;
};

export const spinnerLookup = (layer: string, userProps: SpinnerProps): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['appearance'] ||
    layer === userProps['size'] ||
    (!userProps['size'] && layer === getDefaultSize())
  );
};

const spinnerTailContainer: React.FunctionComponent<SpinnerProps> = (props: SpinnerProps) => {
  const { size } = props;
  /* TODO: Add back in when native animated spinner is ready
   *return <RCTNativeAnimatedSpinner {...{ ...props, style: { position: 'absolute', height: diameterSizeMap[size], width: diameterSizeMap[size], overflow: 'hidden' } }} />;
   */
  return (
    <RCTNativeAnimatedContainer
      {...{
        ...props,
        nativeAnimationClass: 'NativeAnimatedSpinner',
        style: { position: 'absolute', height: diameterSizeMap[size], width: diameterSizeMap[size], overflow: 'hidden' },
      }}
    />
  );
};

export const Spinner = compose<SpinnerType>({
  displayName: spinnerName,
  ...stylingSettings,
  slots: {
    root: View,
    track: trackSvg,
    tail: tailSvg,
    tailContainer: spinnerTailContainer,
    label: Text,
  },
  useRender: (props: SpinnerProps, useSlots: UseSlots<SpinnerType>) => {
    const spinnerProps = useSpinner(props);
    const Slots = useSlots(spinnerProps, (layer) => spinnerLookup(layer, spinnerProps));

    return (final: SpinnerProps) => {
      const { ...mergedProps } = mergeProps(spinnerProps, final);
      return (
        <Slots.root {...mergedProps}>
          <Slots.track />
          <Slots.tailContainer>
            <Slots.tail />
          </Slots.tailContainer>
        </Slots.root>
      );
    };
  },
});
