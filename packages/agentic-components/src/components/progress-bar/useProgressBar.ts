import * as React from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import type { AccessibilityState, AccessibilityValue, ColorValue } from 'react-native';

import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { Icon } from '../../primitives/icon/icon';
import type { ProgressBarState, ProgressBarProps, ProgressBarStatus } from './progress-bar.types';
import { getProgressBarThemeStyles } from './progress-bar.styles';

const DEFAULT_LABEL = 'Label';
const DEFAULT_ERROR_TEXT = 'Progress failed';
const DEFAULT_SUCCESS_TEXT = 'Complete';
const DEFAULT_INDETERMINATE_TEXT = 'Working…';
const DEFAULT_INDETERMINATE_SEGMENT_RATIO = 0.35;
const DEFAULT_INDETERMINATE_DURATION = 2000;

function clampProgress(value: number | undefined): number {
  const number = value ?? 0;
  if (Number.isNaN(number)) {
    return 0;
  }
  return Math.min(100, Math.max(0, number));
}

function getStatusColor(themeState: ReturnType<typeof useThemeState>, status: ProgressBarStatus): ColorValue {
  const { color } = themeState.tokens;
  switch (status) {
    case 'error':
      return color.foregroundDangerPrimary;
    case 'success':
      return color.foregroundSuccessPrimary;
    case 'neutral':
    default:
      return color.foregroundBrandPrimary;
  }
}

function getDefaultIcon(status: ProgressBarStatus) {
  switch (status) {
    case 'error':
      return {
        fontSource: { codepoint: 0x2716, fontFamily: 'Arial' },
      } as const;
    case 'success':
      return {
        fontSource: { codepoint: 0x2713, fontFamily: 'Arial' },
      } as const;
    default:
      return undefined;
  }
}

function getResolvedValueText(type: ProgressBarProps['type'], status: ProgressBarProps['status'], progress: number, valueText?: string) {
  if (valueText !== undefined) {
    return valueText;
  }

  switch (status) {
    case 'error':
      return DEFAULT_ERROR_TEXT;
    case 'success':
      return DEFAULT_SUCCESS_TEXT;
    default:
      return type === 'indeterminate' ? DEFAULT_INDETERMINATE_TEXT : `${progress}%`;
  }
}

function mergeLabelledBy(labelledBy: string | string[] | undefined, labelId: string): string | string[] {
  if (labelledBy === undefined) {
    return labelId;
  }
  return Array.isArray(labelledBy) ? [...labelledBy, labelId] : [labelledBy, labelId];
}

export function useProgressBar_unstable(props: ProgressBarProps): ProgressBarState {
  const {
    accessibilityState,
    accessibilityValue,
    label: labelProp = DEFAULT_LABEL,
    progress: progressProp = 0,
    showValidationIcon: showValidationIconProp,
    showValueText = true,
    status = 'neutral',
    style: userStyle,
    type = 'determinate',
    valueText: valueTextProp,
    validationIcon: validationIconProp,
    ...rootProps
  } = props;

  const themeState = useThemeState();
  const styles = getProgressBarThemeStyles(themeState);
  const labelId = React.useId();
  const resolvedProgress = clampProgress(progressProp);
  const [trackLayoutWidth, setTrackLayoutWidth] = React.useState(0);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = React.useState(false);
  const [resolvedDeterminateProgress, setResolvedDeterminateProgress] = React.useState(resolvedProgress);
  const previousType = React.useRef(type);
  const indicatorTranslateX = React.useRef(new Animated.Value(0)).current;
  const indeterminateAnimation = React.useRef<Animated.CompositeAnimation | undefined>(undefined);

  React.useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) {
        setIsReduceMotionEnabled(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduceMotionEnabled);
    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  React.useEffect(() => {
    if (type === 'indeterminate') {
      previousType.current = type;
      return;
    }

    setResolvedDeterminateProgress((current) => {
      if (previousType.current === 'indeterminate') {
        return resolvedProgress;
      }
      return Math.max(current, resolvedProgress);
    });
    previousType.current = type;
  }, [resolvedProgress, type]);

  React.useEffect(() => {
    if (type !== 'indeterminate' || isReduceMotionEnabled || trackLayoutWidth <= 0) {
      indeterminateAnimation.current?.stop();
      indicatorTranslateX.setValue(0);
      return undefined;
    }

    const indicatorWidth = Math.max(trackLayoutWidth * DEFAULT_INDETERMINATE_SEGMENT_RATIO, 16);
    const travelDistance = Math.max(trackLayoutWidth - indicatorWidth, 0);
    indicatorTranslateX.setValue(0);

    indeterminateAnimation.current?.stop();
    indeterminateAnimation.current = Animated.loop(
      Animated.timing(indicatorTranslateX, {
        toValue: travelDistance,
        duration: DEFAULT_INDETERMINATE_DURATION,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    indeterminateAnimation.current.start();

    return () => {
      indeterminateAnimation.current?.stop();
    };
  }, [indicatorTranslateX, isReduceMotionEnabled, trackLayoutWidth, type]);

  const showValidationIcon = showValidationIconProp ?? status !== 'neutral';
  const statusColor = getStatusColor(themeState, status);
  const resolvedValueText = getResolvedValueText(type, status, resolvedDeterminateProgress, valueTextProp);
  const accessibilityValueToUse: AccessibilityValue | undefined =
    type === 'indeterminate'
      ? undefined
      : {
          ...accessibilityValue,
          max: 100,
          min: 0,
          now: resolvedDeterminateProgress,
          text: resolvedValueText !== `${resolvedDeterminateProgress}%` ? resolvedValueText : accessibilityValue?.text,
        };

  const accessibilityStateToUse: AccessibilityState | undefined = {
    ...accessibilityState,
    ...(type === 'indeterminate' ? { busy: true } : {}),
  };

  const root = useSlot(View, {
    ...rootProps,
    accessibilityLabelledBy: mergeLabelledBy(rootProps.accessibilityLabelledBy, labelId),
    accessibilityRole: 'progressbar',
    accessibilityState: accessibilityStateToUse,
    accessibilityValue: accessibilityValueToUse,
    accessible: rootProps.accessible ?? true,
    focusable: false,
  });
  const validationIcon = useOptionalSlot(
    Icon,
    showValidationIcon ? (validationIconProp === null ? null : (validationIconProp ?? getDefaultIcon(status))) : null,
    {
      defaultProps: {
        accessible: false,
      },
      renderByDefault: showValidationIcon && status !== 'neutral' && validationIconProp !== null,
    },
  );
  const track = useSlot(View, {
    accessible: false,
    onLayout: (event) => {
      setTrackLayoutWidth(event.nativeEvent.layout.width);
    },
  });
  const indicator = useSlot(Animated.View, {
    accessible: false,
  });

  return {
    ...themeState,
    accessibilityState: accessibilityStateToUse,
    accessibilityValue: accessibilityValueToUse,
    indicator,
    indicatorColor: statusColor,
    indicatorTranslateX,
    indicatorTransitionDuration: type === 'static' || isReduceMotionEnabled ? '0ms' : '200ms',
    indicatorWidth:
      type === 'indeterminate'
        ? trackLayoutWidth > 0
          ? Math.max(trackLayoutWidth * DEFAULT_INDETERMINATE_SEGMENT_RATIO, 16)
          : 0
        : trackLayoutWidth > 0
          ? (trackLayoutWidth * resolvedDeterminateProgress) / 100
          : 0,
    isReduceMotionEnabled,
    labelId,
    label: labelProp,
    styles,
    progress: resolvedDeterminateProgress,
    root,
    rootStyle: userStyle,
    showValidationIcon,
    showValueText,
    status,
    track,
    trackLayoutWidth,
    type,
    validationIcon,
    validationIconColor: statusColor,
    valueText: resolvedValueText,
  };
}
