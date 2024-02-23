import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

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

export const defaultTabColorTokens: TokenSettings<TabTokens, Theme> = (t: Theme) =>
  ({
    borderColor: t.colors.transparentBackground,
    color: t.colors.neutralForeground2,
    iconColor: t.colors.neutralForeground2,
    indicatorColor: t.colors.transparentBackground,
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
        subtle: {
          indicatorColor: t.colors.compoundBrandStroke1Hover,
        },
      },
      disabled: {
        indicatorColor: t.colors.transparentBackground,
      },
      transparent: {
        backgroundColor: t.colors.transparentBackgroundHover,
      },
      subtle: {
        backgroundColor: t.colors.subtleBackgroundHover,
        indicatorColor: t.colors.neutralStroke1Hover,
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
  } as TabTokens);
