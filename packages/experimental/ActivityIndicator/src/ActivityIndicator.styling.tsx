import type { ActivityIndicatorProps as CoreActivityIndicatorProps } from 'react-native';
import { Appearance } from 'react-native';

import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import assertNever from 'assert-never';

import type {
  ActivityIndicatorProps,
  FluentActivityIndicatorSlotProps,
  ActivityIndicatorTokens,
  CoreActivityIndicatorSlotProps,
  ActivityIndicatorSize,
} from './ActivityIndicator.types';
import { activityIndicatorName } from './ActivityIndicator.types';

export const diameterSizeMap: { [key: string]: number } = {
  xSmall: 12,
  small: 16,
  medium: 24,
  large: 32,
  xLarge: 36,
};
export const lineThicknessSizeMap: { [key: string]: number } = {
  xSmall: 1,
  small: 1,
  medium: 2,
  large: 3,
  xLarge: 4,
};

// Size coversion ramp from the Fluent ActivityIndicator size to the RN ActivityIndicator.
export function coreSizeFromFluentSize(fluentSize: ActivityIndicatorSize): CoreActivityIndicatorProps['size'] {
  if (typeof fluentSize === 'undefined') {
    return fluentSize;
  }

  switch (fluentSize) {
    case 'xSmall':
      return 'small';
    case 'small':
      return 'small';
    case 'medium':
      return 'small';
    case 'large':
      return 'large';
    case 'xLarge':
      return 'large';
    default:
      assertNever(fluentSize);
  }
}

export const stylingSettings: UseStylingOptions<ActivityIndicatorProps, FluentActivityIndicatorSlotProps, ActivityIndicatorTokens> = {
  tokens: [
    () => ({
      activityIndicatorColor: Appearance.getColorScheme() === 'light' ? '#BDBDBD' : '#666666',
      lineThickness: 'medium',
      size: 'medium',
    }),
    activityIndicatorName,
  ],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: ActivityIndicatorTokens) => ({
        activityIndicatorColor: tokens.activityIndicatorColor,
        size: tokens.size,
        lineThickness: tokens.lineThickness != 'medium' ? tokens.lineThickness : tokens.size,
        accessibilityLabel: 'progressbar',
        accessible: true,
        style: {
          width: diameterSizeMap[tokens.size],
          height: diameterSizeMap[tokens.size],
        },
      }),
      ['activityIndicatorColor', 'lineThickness', 'size'],
    ),
    svg: buildProps(
      (tokens: ActivityIndicatorTokens) => ({
        width: diameterSizeMap[tokens.size],
        height: diameterSizeMap[tokens.size],
      }),
      ['size'],
    ),
  },
};

// Minimal styling settings for the RN Core ActivityIndicator
export const coreStylingSettings: UseStylingOptions<ActivityIndicatorProps, CoreActivityIndicatorSlotProps, ActivityIndicatorTokens> = {
  tokens: [
    () => ({
      size: 'small',
    }),
    activityIndicatorName,
  ],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: ActivityIndicatorTokens) => ({
        color: tokens.activityIndicatorColor,
        ...(tokens.size && { size: coreSizeFromFluentSize(tokens.size) }), // Only pass in the prop if defined
      }),
      ['activityIndicatorColor', 'size'],
    ),
  },
};
