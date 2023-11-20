import { buildUseTokens } from '@fluentui-react-native/framework';
import type { Theme } from '@fluentui-react-native/framework';
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
    borderColor: t.colors.transparentStroke,
    color: t.colors.neutralForeground2,
    iconColor: t.colors.neutralForeground2,
    indicatorColor: t.colors.transparentStroke,
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
        color: t.colors.neutralForeground1Pressed,
        iconColor: t.colors.compoundBrandForeground1Pressed,
        indicatorColor: t.colors.compoundBrandStroke1Pressed,
      },
    },
    disabled: {
      color: t.colors.neutralForegroundDisabled,
      iconColor: t.colors.neutralForegroundDisabled,
      selected: {
        color: t.colors.neutralForegroundDisabled,
        iconColor: t.colors.neutralForegroundDisabled,
        indicatorColor: t.colors.neutralForegroundDisabled,
      },
    },
    hovered: {
      color: t.colors.neutralForeground2Hover,
      iconColor: t.colors.neutralForeground2Hover,
      indicatorColor: t.colors.neutralStroke1Hover,
      selected: {
        color: t.colors.neutralForeground1Hover,
        iconColor: t.colors.compoundBrandForeground1Hover,
        indicatorColor: t.colors.compoundBrandStroke1Hover,
      },
      disabled: {
        indicatorColor: t.colors.transparentStroke,
      },
      transparent: {
        backgroundColor: t.colors.transparentBackgroundHover,
      },
      subtle: {
        backgroundColor: t.colors.subtleBackgroundHover,
      },
    },
    pressed: {
      color: t.colors.neutralForeground2Pressed,
      iconColor: t.colors.neutralForeground2Pressed,
      indicatorColor: t.colors.neutralStroke1Pressed,
      transparent: {
        backgroundColor: t.colors.transparentBackgroundPressed,
      },
      subtle: {
        backgroundColor: t.colors.subtleBackgroundPressed,
      },
    },
    focused: {
      borderColor: t.colors.neutralForeground1,
    },
    hasIcon: {
      contentMarginStart: 8,
    },
  } as TabTokens);

export const useTabTokens = buildUseTokens(defaultTabTokens);
