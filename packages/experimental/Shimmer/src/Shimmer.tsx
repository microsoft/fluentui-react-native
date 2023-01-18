/** @jsx withSlots */
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Circle, ClipPath, Defs, LinearGradient, Rect, Stop, Svg, G, TransformObject } from 'react-native-svg';
import { shimmerName, ShimmerProps, ShimmerType } from './Shimmer.types';
import { compose, mergeProps, withSlots, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { Animated, I18nManager } from 'react-native';
import { stylingSettings } from './Shimmer.styling';
import assertNever from 'assert-never';

const useStyling = buildUseStyling(stylingSettings);
export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  ...stylingSettings,
  slots: {
    root: Svg,
  },
  useRender: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const Slots = useSlots(props);
    const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
    const tokens = useStyling(props).root;
    const memoizedShimmerData = useMemo(
      () => ({
        angle: props.angle ? props.angle : tokens['angle'],
        containerWidth: props?.style?.['width'] ? props?.style['width'] : '100%',
        containerHeight: props?.style?.['height'] ? props?.style['height'] : '100%',
        delay: props.delay ? props.delay : tokens['delay'],
        duration: props.duration ? props.duration : tokens['duration'],
        shimmerColor: props.shimmerColor ? props.shimmerColor : tokens['shimmerColor'],
        shimmerColorOpacity: tokens['shimmerColorOpacity'],
        shimmerWaveColor: props.shimmerWaveColor ? props.shimmerWaveColor : tokens['shimmerWaveColor'],
        shimmerWaveColorOpacity: tokens['shimmerWaveColorOpacity'],
      }),
      [
        props.angle,
        props.delay,
        props.duration,
        props.shimmerColor,
        props.shimmerColorOpacity,
        props.shimmerWaveColor,
        props.shimmerWaveColorOpacity,
        props.style,
      ],
    );

    /* The shimmer animation is implemented using a LinearGradient which travels from left to right.
     * Different angles are handled by rotating this gradient.
     * The startValue is used to control the start position of the gradient animation, it is set as -1 to make sure it is starts off the screen for any angle.
     * Similarly the endValue is set to 2 to make sure the gradient animation exits the entire screen for any angle.
     */
    const startValue = useRef(new Animated.Value(-1)).current;
    const shimmerAnimation = useCallback(() => {
      Animated.loop(
        Animated.timing(startValue, {
          toValue: 2,
          duration: memoizedShimmerData.duration,
          delay: memoizedShimmerData.delay,
          useNativeDriver: true,
        }),
      ).start();
    }, [memoizedShimmerData.delay, memoizedShimmerData.duration]);

    useEffect(() => {
      shimmerAnimation();
    });

    return (rest: ShimmerProps) => {
      const { elements, ...mergedProps } = mergeProps(props, rest);
      const rows = [];

      if (elements) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element.type == 'rect') {
            rows.push(
              <Rect
                key={i}
                width={element.width}
                height={element.height}
                x={element.x}
                y={element.y}
                rx={element.borderRadiusX}
                ry={element.borderRadiusY}
              />,
            );
          } else if (element.type == 'circle') {
            rows.push(<Circle key={i} r={element.radius} cx={element.cx} cy={element.cy} />);
          } else {
            assertNever(element);
          }
        }
      }

      // Flip the SVG if we are running in RTL
      const rtlTransfrom: TransformObject = I18nManager.isRTL ? { translateX: memoizedShimmerData.containerWidth, scaleX: -1 } : {};

      return (
        <Slots.root {...mergedProps}>
          <Defs>
            <AnimatedLinearGradient id="gradient" x1={startValue} x2="-1" gradientTransform={`rotate(${memoizedShimmerData.angle})`}>
              <Stop offset="10%" stopColor={memoizedShimmerData.shimmerColor} stopOpacity={memoizedShimmerData.shimmerColorOpacity} />
              <Stop
                offset="20%"
                stopColor={memoizedShimmerData.shimmerWaveColor}
                stopOpacity={memoizedShimmerData.shimmerWaveColorOpacity}
              />
              <Stop offset="30%" stopColor={memoizedShimmerData.shimmerColor} stopOpacity={memoizedShimmerData.shimmerColorOpacity} />
            </AnimatedLinearGradient>
            <ClipPath id="shimmerView">{rows}</ClipPath>
          </Defs>
          <G transform={rtlTransfrom}>
            <Rect
              x="0"
              y="0"
              width={memoizedShimmerData.containerWidth}
              height={memoizedShimmerData.containerHeight}
              fill="url(#gradient)"
              clipPath="url(#shimmerView)"
            />
          </G>
        </Slots.root>
      );
    };
  },
});
