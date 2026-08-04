import * as React from 'react';
import type { ColorValue, TextStyle, ViewStyle } from 'react-native';

import type { ButtonState } from './button.types';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import {
  cornerRadius40,
  cornerRadius60,
  cornerRadius80,
  cornerRadiusCircular,
  cornerRadiusNone,
  fontLineHeight200,
  fontLineHeight300,
  fontLineHeight400,
  fontSize200,
  fontSize300,
  fontSize400,
  fontWeightRegular,
  fontWeightSemibold,
  size20,
  size40,
  size60,
  size80,
  size100,
  size120,
  size160,
  size200,
  size240,
  sizeNone,
  strokeWidth10,
  strokeWidth20,
} from '@fluentui-react-native/design/tokens/global';
import type { ThemeState } from '@fluentui-react-native/design';

import type { ButtonAppearance, ButtonShape, ButtonSize } from './button.types';

type FlexTokens = ThemeState['tokens'];
type ColorTokens = FlexTokens['color'];

type ButtonColors = {
  backgroundColor: ColorValue;
  borderColor: ColorValue;
  foregroundColor: ColorValue;
};

const sizeStyles: Record<
  ButtonSize,
  {
    borderRadius: number;
    fontSize: number;
    gap: number;
    iconSize: number;
    lineHeight: number;
    paddingHorizontal: number;
    paddingIconOnly: number;
    paddingVertical: number;
  }
> = {
  small: {
    borderRadius: cornerRadius40,
    fontSize: fontSize200,
    gap: size20,
    iconSize: size160,
    lineHeight: fontLineHeight200,
    paddingHorizontal: size80,
    paddingIconOnly: size40,
    paddingVertical: size40,
  },
  medium: {
    borderRadius: cornerRadius60,
    fontSize: fontSize300,
    gap: size40,
    iconSize: size200,
    lineHeight: fontLineHeight300,
    paddingHorizontal: size100,
    paddingIconOnly: size60,
    paddingVertical: size60,
  },
  large: {
    borderRadius: cornerRadius80,
    fontSize: fontSize400,
    gap: size60,
    iconSize: size200,
    lineHeight: fontLineHeight400,
    paddingHorizontal: size120,
    paddingIconOnly: size100,
    paddingVertical: size80,
  },
};

function getInteractionTokens(colors: ColorTokens, pressed: boolean, hovered: boolean): ColorTokens {
  if (pressed) {
    return { ...colors, ...colors.pressed };
  }
  if (hovered) {
    return { ...colors, ...colors.hover };
  }
  return colors;
}

function getButtonColors(
  colors: ColorTokens,
  appearance: ButtonAppearance,
  disabled: boolean,
  selected: boolean,
  pressed: boolean,
  hovered: boolean,
): ButtonColors {
  if (disabled) {
    return getDisabledColors(colors, appearance, selected);
  }

  const interactionTokens = getInteractionTokens(colors, pressed, hovered);
  if (selected) {
    switch (appearance) {
      case 'primary':
        return {
          backgroundColor: interactionTokens.backgroundBrandHeavy,
          borderColor: interactionTokens.strokeNeutralTransparent,
          foregroundColor: interactionTokens.foregroundBrandOnloud,
        };
      case 'secondary':
        return {
          backgroundColor: interactionTokens.backgroundNeutralHeavy,
          borderColor: interactionTokens.strokeNeutralTransparent,
          foregroundColor: interactionTokens.foregroundNeutralOnloud,
        };
      case 'outline':
        return {
          backgroundColor: interactionTokens.backgroundNeutralHeavy,
          borderColor: interactionTokens.strokeNeutralHeavy,
          foregroundColor: interactionTokens.foregroundNeutralOnloud,
        };
      case 'subtle':
        return {
          backgroundColor: interactionTokens.backgroundNeutralSoft,
          borderColor: interactionTokens.strokeNeutralTransparent,
          foregroundColor: interactionTokens.foregroundNeutralPrimary,
        };
    }
  }

  switch (appearance) {
    case 'primary':
      return {
        backgroundColor: interactionTokens.backgroundBrandHeavy,
        borderColor: interactionTokens.strokeNeutralTransparent,
        foregroundColor: interactionTokens.foregroundBrandOnloud,
      };
    case 'secondary':
      return {
        backgroundColor: interactionTokens.backgroundNeutralSubtle,
        borderColor: interactionTokens.strokeNeutralTransparent,
        foregroundColor: interactionTokens.foregroundNeutralPrimary,
      };
    case 'outline':
      return {
        backgroundColor: interactionTokens.backgroundNeutralTransparent,
        borderColor: interactionTokens.strokeNeutralSubtle,
        foregroundColor: interactionTokens.foregroundNeutralPrimary,
      };
    case 'subtle':
      return {
        backgroundColor: interactionTokens.backgroundNeutralTransparent,
        borderColor: interactionTokens.strokeNeutralTransparent,
        foregroundColor: interactionTokens.foregroundNeutralPrimary,
      };
  }

  return assertNever(appearance);
}

function getDisabledColors(colors: ColorTokens, appearance: ButtonAppearance, selected: boolean): ButtonColors {
  const foregroundColor = colors.foregroundNeutralDisabled;
  const borderColor = appearance === 'outline' ? colors.strokeNeutralDisabled : colors.strokeNeutralTransparent;

  if (appearance === 'primary') {
    return { backgroundColor: colors.backgroundNeutralHeavyDisabled, borderColor, foregroundColor };
  }
  if (selected && (appearance === 'secondary' || appearance === 'outline')) {
    return { backgroundColor: colors.backgroundNeutralHeavyDisabled, borderColor, foregroundColor };
  }
  if (selected && appearance === 'subtle') {
    return { backgroundColor: colors.backgroundNeutralSubtleDisabled, borderColor, foregroundColor };
  }
  if (appearance === 'secondary') {
    return { backgroundColor: colors.backgroundNeutralSubtleDisabled, borderColor, foregroundColor };
  }
  return { backgroundColor: colors.backgroundNeutralTransparent, borderColor, foregroundColor };
}

function getBorderRadius(shape: ButtonShape, size: ButtonSize): number {
  if (shape === 'circle') {
    return cornerRadiusCircular;
  }
  if (shape === 'square') {
    return cornerRadiusNone;
  }
  return sizeStyles[size].borderRadius;
}

function assertNever(value: never): never {
  throw new Error(`Unexpected Button variant: ${value}`);
}

/**
 * This hook applies the appropriate styles to the button slots based on the current state.
 * - this is a hook to allow useMemo if appropriate for performance optimization
 * @param state the state containing the slots to attach the styles to
 */
export function useApplyStyles_unstable(state: ButtonState) {
  const { appearance, disabled, focused, hovered, iconOnly, pressed, selected, shape, size, tokens, userStyle } = state;
  const styles = React.useMemo(() => {
    const sizing = sizeStyles[size];
    const colors = getButtonColors(tokens.color, appearance, disabled, selected, pressed, hovered);
    const root: ViewStyle = {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderRadius: getBorderRadius(shape, size),
      borderStyle: 'solid',
      borderWidth: strokeWidth10,
      flexDirection: 'row',
      gap: iconOnly ? undefined : sizing.gap,
      justifyContent: 'center',
      minHeight: size240,
      minWidth: size240,
      ...(focused &&
        !disabled && {
          borderColor: tokens.color.strokeFocusInner,
          outlineColor: tokens.color.strokeFocusOuter,
          outlineOffset: strokeWidth10,
          outlineStyle: 'solid',
          outlineWidth: strokeWidth20,
        }),
      paddingHorizontal: iconOnly ? sizing.paddingIconOnly : sizing.paddingHorizontal,
      paddingVertical: iconOnly ? sizing.paddingIconOnly : sizing.paddingVertical,
    };
    const content: TextStyle = {
      color: colors.foregroundColor,
      fontSize: sizing.fontSize,
      fontWeight: selected ? fontWeightSemibold : fontWeightRegular,
      lineHeight: sizing.lineHeight,
      textAlign: 'center',
    };
    const contentHidden: TextStyle = {
      ...content,
      fontWeight: fontWeightSemibold,
      opacity: sizeNone,
    };
    const contentVisible: TextStyle = {
      ...content,
      bottom: sizeNone,
      left: sizeNone,
      position: 'absolute',
      right: sizeNone,
      top: sizeNone,
    };
    const contentContainer: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    };

    return { colors, content, contentContainer, contentHidden, contentVisible, root, sizing };
  }, [appearance, disabled, focused, hovered, iconOnly, pressed, selected, shape, size, tokens]);

  attachSlotProps(state.root, { style: [styles.root, userStyle] });
  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: styles.colors.foregroundColor,
      height: styles.sizing.iconSize,
      width: styles.sizing.iconSize,
    });
  }
  if (state.selectedIcon) {
    attachSlotProps(state.selectedIcon, {
      accessible: false,
      color: styles.colors.foregroundColor,
      height: styles.sizing.iconSize,
      width: styles.sizing.iconSize,
    });
  }
  if (state.content) {
    attachSlotProps(state.content, { numberOfLines: 1, style: state.isToggleButton ? styles.contentVisible : styles.content });
  }
  if (state.contentHidden) {
    attachSlotProps(state.contentHidden, {
      accessibilityElementsHidden: true,
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
      numberOfLines: 1,
      style: styles.contentHidden,
    });
  }
  if (state.contentContainer) {
    attachSlotProps(state.contentContainer, { accessible: false, style: styles.contentContainer });
  }
}
