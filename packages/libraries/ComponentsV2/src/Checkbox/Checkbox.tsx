import * as React from 'react';
import type { AccessibilityActionEvent, ColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useKeyProps, usePressableState } from '@fluentui/react-native';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

import type {
  CheckboxCheckedState,
  CheckboxOnChangeData,
  CheckboxProps,
  CheckboxShape,
  CheckboxSize,
} from './Checkbox.types';

const checkmarkPath =
  'M9.76497 3.20474C10.0661 3.48915 10.0797 3.96383 9.79526 4.26497L5.54526 8.76497C5.40613 8.91228 5.21332 8.99703 5.01071 8.99993C4.8081 9.00282 4.61295 8.92361 4.46967 8.78033L2.21967 6.53033C1.92678 6.23744 1.92678 5.76257 2.21967 5.46967C2.51256 5.17678 2.98744 5.17678 3.28033 5.46967L4.98463 7.17397L8.70474 3.23503C8.98915 2.9339 9.46383 2.92033 9.76497 3.20474Z';

interface IndicatorColors {
  backgroundColor: ColorValue | undefined;
  borderColor: ColorValue | undefined;
  glyphColor: ColorValue | undefined;
}

function nextCheckedState(checked: CheckboxCheckedState): boolean {
  return checked === 'mixed' ? true : !checked;
}

function CheckboxGlyph({
  checked,
  color,
  shape,
  size,
}: {
  checked: CheckboxCheckedState;
  color: ColorValue | undefined;
  shape: CheckboxShape;
  size: CheckboxSize;
}): React.ReactElement | null {
  if (!checked) {
    return null;
  }

  const glyphSize = size === 'large' ? 16 : 12;

  if (checked === 'mixed') {
    return (
      <Svg height={glyphSize} viewBox={`0 0 ${glyphSize} ${glyphSize}`} width={glyphSize}>
        {shape === 'circular' ? (
          <Circle cx={glyphSize / 2} cy={glyphSize / 2} fill={color} r={glyphSize / 4} />
        ) : (
          <Rect
            fill={color}
            height={glyphSize === 16 ? 4 : 3}
            rx={1}
            width={glyphSize === 16 ? 10 : 8}
            x={glyphSize === 16 ? 3 : 2}
            y={glyphSize === 16 ? 6 : 4.5}
          />
        )}
      </Svg>
    );
  }

  return (
    <Svg height={glyphSize} viewBox="0 0 12 12" width={glyphSize}>
      <Path d={checkmarkPath} fill={color} />
    </Svg>
  );
}

function getIndicatorColors(
  theme: ReturnType<typeof useFluentTheme>,
  checked: CheckboxCheckedState,
  disabled: boolean,
  hovered: boolean,
  pressed: boolean,
): IndicatorColors {
  if (disabled) {
    return {
      backgroundColor: 'transparent',
      borderColor: theme.colors.neutralStrokeDisabled,
      glyphColor: theme.colors.neutralForegroundDisabled,
    };
  }

  if (checked === 'mixed') {
    return {
      backgroundColor: 'transparent',
      borderColor: pressed
        ? theme.colors.compoundBrandStroke1Pressed
        : hovered
          ? theme.colors.compoundBrandStroke1Hover
          : theme.colors.compoundBrandStroke1,
      glyphColor: pressed
        ? theme.colors.compoundBrandForeground1Pressed
        : hovered
          ? theme.colors.compoundBrandForeground1Hover
          : theme.colors.compoundBrandForeground1,
    };
  }

  if (checked) {
    const brandBackground = pressed
      ? theme.colors.compoundBrandBackground1Pressed
      : hovered
        ? theme.colors.compoundBrandBackground1Hover
        : theme.colors.compoundBrandBackground1;
    return {
      backgroundColor: brandBackground,
      borderColor: brandBackground,
      glyphColor: theme.colors.neutralForegroundInverted,
    };
  }

  return {
    backgroundColor: 'transparent',
    borderColor: pressed
      ? theme.colors.neutralStrokeAccessiblePressed
      : hovered
        ? theme.colors.neutralStrokeAccessibleHover
        : theme.colors.neutralStrokeAccessible,
    glyphColor: 'transparent',
  };
}

function getLabelColor(
  theme: ReturnType<typeof useFluentTheme>,
  checked: CheckboxCheckedState,
  disabled: boolean,
  hovered: boolean,
  pressed: boolean,
): ColorValue | undefined {
  if (disabled) {
    return theme.colors.neutralForegroundDisabled;
  }
  if (checked || pressed) {
    return theme.colors.neutralForeground1;
  }
  if (hovered) {
    return theme.colors.neutralForeground2;
  }
  return theme.colors.neutralForeground3;
}

function renderLabel(
  label: React.ReactNode,
  labelColor: ColorValue | undefined,
  required: boolean,
  requiredColor: ColorValue | undefined,
  labelStyle: StyleProp<ViewStyle>,
): React.ReactElement | null {
  if (label === undefined || label === null) {
    return null;
  }

  return (
    <View style={[styles.labelContainer, labelStyle]}>
      {typeof label === 'string' || typeof label === 'number' ? (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      ) : (
        label
      )}
      {required ? <Text style={[styles.required, { color: requiredColor }]}>*</Text> : null}
    </View>
  );
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof Pressable>, CheckboxProps>((props, ref) => {
  const {
    accessibilityActions,
    accessibilityLabel,
    accessibilityState,
    checked,
    defaultChecked = false,
    disabled = false,
    focusable,
    hitSlop,
    label,
    labelPosition = 'after',
    onAccessibilityAction,
    onChange,
    required = false,
    shape = 'square',
    size = 'medium',
    style,
    testID,
    ...rest
  } = props;
  const theme = useFluentTheme();
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState<CheckboxCheckedState>(defaultChecked);
  const currentChecked = checked ?? uncontrolledChecked;

  const requestChange = React.useCallback(
    (event: Parameters<NonNullable<CheckboxProps['onChange']>>[0]) => {
      if (disabled) {
        return;
      }

      const nextChecked = nextCheckedState(currentChecked);
      if (checked === undefined) {
        setUncontrolledChecked(nextChecked);
      }
      onChange?.(event, { checked: nextChecked });
    },
    [checked, currentChecked, disabled, onChange],
  );

  const handleAccessibilityAction = React.useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName.toLocaleLowerCase() === 'toggle') {
        requestChange(event);
      }
      onAccessibilityAction?.(event);
    },
    [onAccessibilityAction, requestChange],
  );

  const pressable = usePressableState({
    ...rest,
    disabled,
    onPress: requestChange,
  });
  const keyProps = useKeyProps(requestChange, ' ');
  const indicatorColors = getIndicatorColors(
    theme,
    currentChecked,
    disabled,
    !!pressable.state.hovered,
    !!pressable.state.pressed,
  );
  const labelColor = getLabelColor(
    theme,
    currentChecked,
    disabled,
    !!pressable.state.hovered,
    !!pressable.state.pressed,
  );
  const resolvedStyle = typeof style === 'function' ? style({ pressed: !!pressable.state.pressed }) : style;
  const indicatorSize = size === 'large' ? 20 : 16;
  const indicator = (
    <View
      accessible={false}
      focusable={false}
      style={[
        styles.indicator,
        {
          backgroundColor: indicatorColors.backgroundColor,
          borderColor: indicatorColors.borderColor,
          borderRadius: shape === 'circular' ? indicatorSize / 2 : 2,
          height: indicatorSize,
          width: indicatorSize,
        },
      ]}
      testID={testID ? `${testID}-indicator` : undefined}
    >
      <CheckboxGlyph checked={currentChecked} color={indicatorColors.glyphColor} shape={shape} size={size} />
    </View>
  );
  const labelElement = renderLabel(
    label,
    labelColor,
    required,
    theme.colors.redForeground1,
    labelPosition === 'before' ? styles.labelBefore : styles.labelAfter,
  );
  const mergedAccessibilityActions = React.useMemo(
    () => [{ name: 'toggle' as const }, ...(accessibilityActions ?? [])],
    [accessibilityActions],
  );

  return (
    <Pressable
      {...pressable.props}
      {...keyProps}
      accessibilityActions={mergedAccessibilityActions}
      accessibilityLabel={accessibilityLabel ?? (typeof label === 'string' ? label : undefined)}
      accessibilityRole="checkbox"
      accessibilityState={{
        ...accessibilityState,
        checked: currentChecked,
        disabled,
      }}
      aria-required={required}
      focusable={focusable ?? !disabled}
      hitSlop={hitSlop ?? 4}
      onAccessibilityAction={handleAccessibilityAction}
      ref={ref}
      style={[styles.root, resolvedStyle]}
      testID={testID}
    >
      {labelPosition === 'before' ? labelElement : null}
      {indicator}
      {labelPosition === 'after' ? labelElement : null}
      {pressable.state.focused && !disabled ? (
        <>
          <View
            accessible={false}
            focusable={false}
            pointerEvents="none"
            style={[
              styles.focusOuter,
              {
                borderColor: theme.colors.strokeFocus2,
              },
            ]}
          />
          <View
            accessible={false}
            focusable={false}
            pointerEvents="none"
            style={[
              styles.focusInner,
              {
                borderColor: theme.colors.strokeFocus1,
              },
            ]}
          />
        </>
      ) : null}
    </Pressable>
  );
});

Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  focusInner: {
    borderRadius: 3,
    borderWidth: 1,
    bottom: 1,
    left: 1,
    position: 'absolute',
    right: 1,
    top: 1,
  },
  focusOuter: {
    borderRadius: 4,
    borderWidth: 2,
    bottom: -2,
    left: -2,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  indicator: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
    margin: 8,
    overflow: 'hidden',
  },
  label: {
    flexShrink: 1,
    fontFamily: 'Segoe UI',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } satisfies TextStyle,
  labelAfter: {
    paddingLeft: 4,
    paddingRight: 8,
  },
  labelBefore: {
    paddingLeft: 8,
    paddingRight: 4,
  },
  labelContainer: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    flexShrink: 1,
    minHeight: 36,
    paddingVertical: 8,
  },
  required: {
    fontFamily: 'Segoe UI',
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 2,
  },
  root: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    maxWidth: '100%',
    position: 'relative',
  },
});
