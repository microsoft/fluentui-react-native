import { Animated, View } from 'react-native';
import { Svg } from 'react-native-svg';

import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useReducedMotion, useSharedAnimatedLoop, useSlot } from '@fluentui-react-native/framework-base';

import { getSpinnerMetrics } from './spinner.styles';
import type { SpinnerProps, SpinnerState } from './spinner.types';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const spinnerDuration = 1500;

/**
 * Builds the Spinner state, resolving accessibility, slots, animation, and defaults.
 */
export function useSpinner_unstable(props: SpinnerProps): SpinnerState {
  const { accessibilityLabel, accessibilityLabelledBy, accessibilityState, accessible, size = 'medium', style: userStyle, ...rest } = props;

  const themeState = useThemeState();
  const { center, diameter, radius, strokeWidth } = getSpinnerMetrics(size, themeState.tokens);
  const trackColor = themeState.tokens.color.strokeNeutralSubtle;
  const indicatorColor = themeState.tokens.color.strokeNeutralLoud;
  const reduceMotionEnabled = useReducedMotion();
  const rotation = useSharedAnimatedLoop({
    channel: 'agentic-components:spinner',
    duration: spinnerDuration,
    enabled: reduceMotionEnabled === false,
    useNativeDriver: true,
  });

  useAccessibilityLabelWarning({
    accessibilityLabel: accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Spinner',
    requireLabel: accessible !== false,
    warning: 'Spinner: accessibilityLabel or accessibilityLabelledBy is required when the spinner is exposed directly.',
  });

  const root = useSlot(View, {
    ...rest,
    accessibilityLabel,
    accessibilityLabelledBy,
    role: 'progressbar',
    accessibilityState: {
      ...accessibilityState,
      busy: true,
    },
    accessible: accessible ?? true,
    focusable: false,
    pointerEvents: rest.pointerEvents ?? 'none',
  });
  const svg = useSlot(Svg, {
    as: AnimatedSvg,
    accessible: false,
    height: diameter,
    viewBox: `0 0 ${diameter} ${diameter}`,
    width: diameter,
  });
  return {
    center,
    diameter,
    indicatorColor,
    reduceMotionEnabled,
    radius,
    rotation,
    root,
    size,
    svg,
    strokeWidth,
    trackColor,
    userStyle,
    ...themeState,
  };
}
