import { buildUseTokens } from '@fluentui-react-native/framework';
import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabTokens } from './Tab.types';
import { tabName } from './Tab.types';
import { defaultTabColorTokens } from './TabColorTokens';

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

export const defaultTabTokens: TokenSettings<TabTokens, Theme> = {
  indicatorOrientation: 'horizontal',
  indicatorThickness: 2,
  borderWidth: 2,
  borderRadius: 4,
  contentMarginStart: 2,
  contentMarginEnd: 2,
  flexDirection: 'column',
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
  hasIcon: {
    contentMarginStart: 8,
  },
} as TabTokens;

export const useTabTokens = buildUseTokens(defaultTabTokens, defaultTabColorTokens, tabName);
