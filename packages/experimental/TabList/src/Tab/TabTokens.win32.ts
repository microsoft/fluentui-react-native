import { buildUseTokens } from '@fluentui-react-native/framework';
import type { Theme } from '@fluentui-react-native/framework';
import { isHighContrast } from '@fluentui-react-native/theming-utils';
import type { TokensFromTheme } from '@fluentui-react-native/use-styling';

import type { TabTokens } from '..';

export const tabStates: (keyof TabTokens)[] = [
  'small',
  'medium',
  'large',
  'vertical',
  'hovered',
  'disabled',
  'selected',
  'focused',
  'pressed',
  'transparent',
  'subtle',
  'hasIcon',
];

export const defaultTabTokens: TokensFromTheme<TabTokens, Theme> = (t: Theme) =>
  ({
    indicatorOrientation: 'horizontal',
    indicatorThickness: 2,
    borderWidth: 2,
    borderRadius: 4,
    contentMarginStart: 2,
    contentMarginEnd: 2,
    flexDirection: 'column',
    borderColor: t.colors.transparentBackground,
    color: t.colors.neutralForeground2,
    iconColor: t.colors.neutralForeground2,
    indicatorColor: t.colors.transparentBackground,
    indicatorRadius: 99,
    small: {
      iconSize: 20,
      iconMargin: 2,
      indicatorMargin: 8,
      stackMarginHorizontal: 6,
      stackMarginVertical: 8,
      variant: 'body1',
      selected: {
        variant: 'body1Strong',
      },
    },
    medium: {
      iconSize: 20,
      iconMargin: 6,
      indicatorMargin: 12,
      stackMarginHorizontal: 10,
      stackMarginVertical: 12,
      variant: 'body1',
      selected: {
        variant: 'body1Strong',
      },
    },
    large: {
      iconSize: 24,
      iconMargin: 6,
      indicatorMargin: 12,
      stackMarginHorizontal: 10,
      stackMarginVertical: 16,
      variant: 'body2',
      selected: {
        variant: 'subtitle2',
      },
    },
    vertical: {
      flexDirection: 'row-reverse',
      indicatorOrientation: 'vertical',
      small: {
        indicatorMargin: 4,
        stackMarginHorizontal: 6,
        stackMarginVertical: 2,
      },
      medium: {
        indicatorMargin: 8,
        stackMarginHorizontal: 10,
        stackMarginVertical: 6,
      },
      large: {
        indicatorMargin: 10,
        stackMarginHorizontal: 10,
        stackMarginVertical: 8,
      },
    },
    transparent: {
      backgroundColor: t.colors.transparentBackground,
    },
    subtle: {
      backgroundColor: t.colors.subtleBackground,
    },
    selected: {
      color: t.colors.neutralForeground1,
      iconColor: t.colors.compoundBrandForeground1,
      indicatorColor: t.colors.compoundBrandStroke1,
      pressed: {
        color: isHighContrast(t) ? t.colors.neutralForeground2 : t.colors.neutralForeground1Pressed,
        iconColor: isHighContrast(t) ? t.colors.neutralForeground2 : t.colors.compoundBrandForeground1Pressed,
        indicatorColor: t.colors.compoundBrandStroke1Pressed,
      },
    },
    disabled: {
      color: isHighContrast(t) ? t.colors.neutralStrokeDisabled : t.colors.neutralForegroundDisabled,
      iconColor: isHighContrast(t) ? t.colors.neutralStrokeDisabled : t.colors.neutralForegroundDisabled,
      selected: {
        color: isHighContrast(t) ? t.colors.neutralStrokeDisabled : t.colors.neutralForegroundDisabled,
        iconColor: isHighContrast(t) ? t.colors.neutralStrokeDisabled : t.colors.neutralForegroundDisabled,
        indicatorColor: isHighContrast(t) ? t.colors.neutralStrokeDisabled : t.colors.neutralForegroundDisabled,
      },
    },
    hovered: {
      color: isHighContrast(t) ? t.colors.neutralForeground2 : t.colors.neutralForeground2Hover,
      iconColor: isHighContrast(t) ? t.colors.compoundBrandForeground1Hover : t.colors.neutralForeground2Hover,
      indicatorColor: isHighContrast(t) ? t.colors.compoundBrandStroke1Hover : t.colors.neutralStroke1Hover,
      selected: {
        color: isHighContrast(t) ? t.colors.neutralForeground2 : t.colors.neutralForeground1Hover,
        iconColor: isHighContrast(t) ? t.colors.neutralForeground2 : t.colors.compoundBrandForeground1Hover,
        indicatorColor: t.colors.compoundBrandStroke1Hover,
      },
      disabled: {
        indicatorColor: t.colors.transparentBackground,
      },
      transparent: {
        backgroundColor: t.colors.transparentBackgroundHover,
      },
      subtle: {
        backgroundColor: t.colors.subtleBackgroundHover,
        indicatorColor: isHighContrast(t) ? t.colors.neutralStroke1 : t.colors.neutralStroke1Hover,
      },
    },
    pressed: {
      color: isHighContrast(t) ? t.colors.neutralForeground2 : t.colors.neutralForeground2Pressed,
      iconColor: isHighContrast(t) ? t.colors.neutralForeground2 : t.colors.neutralForeground2Pressed,
      indicatorColor: isHighContrast(t) ? t.colors.compoundBrandBackground1Pressed : t.colors.neutralStroke1Pressed,
      transparent: {
        backgroundColor: t.colors.transparentBackgroundPressed,
      },
      subtle: {
        backgroundColor: t.colors.subtleBackgroundPressed,
      },
    },
    focused: {
      borderColor: isHighContrast(t) ? t.colors.compoundBrandStroke1 : t.colors.neutralForeground1,
    },
    hasIcon: {
      contentMarginStart: 8,
    },
  } as TabTokens);

export const useTabTokens = buildUseTokens(defaultTabTokens);
