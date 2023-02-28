import { Platform } from 'react-native';

import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';

import type {
  AvatarTokens,
  AvatarConfigurableProps,
  AvatarSlotProps,
  AvatarProps,
  AvatarNamedColor,
  AvatarColorSchemes,
} from './Avatar.types';
import { AvatarName, AvatarColors, AvatarSizesForTokens, ColorSchemes } from './Avatar.types';
import { defaultAvatarTokens } from './AvatarTokens';
import { getRingConfig, getRingSpacing, getIconStyles } from './stylingUtils';

export const avatarStates: (keyof AvatarTokens)[] = [
  ...AvatarColors,
  ...AvatarSizesForTokens,
  'neutral',
  'brand',
  'brandInverted',
  'accent',
  'circular',
  'square',
  'inactive',
  'iconColor',
  'iconSize',
  'size',
];

const tokensThatAreAlsoProps: (keyof AvatarConfigurableProps)[] = [
  'active',
  'avatarColor',
  'badgeStatus',
  'initialsColor',
  'outOfOffice',
  'ringBackgroundColor',
  'ringColor',
  'ringInnerGap',
  'ringThickness',
];

export const stylingSettings: UseStylingOptions<AvatarProps, AvatarSlotProps, AvatarTokens> = {
  tokens: [defaultAvatarTokens, AvatarName],
  tokensThatAreAlsoProps,
  states: avatarStates,
  slotProps: {
    root: buildProps(
      (tokens: AvatarTokens) => {
        const { size, active, avatarOpacity } = tokens;
        const ringConfig = getRingConfig(tokens);
        const avatarSize = active === 'active' ? ringConfig.size : size;

        return {
          style: {
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            minWidth: avatarSize,
            minHeight: avatarSize,
            opacity: avatarOpacity,
            aspectRatio: 1,
          },
        };
      },
      ['avatarOpacity', 'size'],
    ),
    initials: buildProps(
      (tokens: AvatarTokens, theme: Theme) => {
        return {
          style: {
            ...fontStyles.from(tokens, theme),
            color: tokens.initialsColor || tokens.color,
            textAlign: 'center',
          },
        };
      },
      ['color', 'initialsColor', ...fontStyles.keys],
    ),
    initialsBackground: buildProps(
      (tokens: AvatarTokens, theme: Theme) => {
        const { backgroundColor, size, avatarColor } = tokens;
        const _avatarColor =
          !avatarColor || AvatarColors.includes(avatarColor as AvatarNamedColor) || ColorSchemes.includes(avatarColor as AvatarColorSchemes)
            ? backgroundColor
            : avatarColor;
        return {
          style: {
            ...borderStyles.from(tokens, theme),
            minWidth: size,
            minHeight: size,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: _avatarColor,
            borderWidth: tokens.borderWidth,
            borderColor: tokens.borderColor,
            ...getRingSpacing(tokens),
            aspectRatio: 1,
          },
        };
      },
      ['avatarColor', 'backgroundColor', 'size', 'borderColor', 'borderWidth', 'ringThickness', ...borderStyles.keys],
    ),
    image: buildProps(
      (tokens: AvatarTokens) => {
        const { borderRadius, size, borderWidth, borderColor } = tokens;
        return {
          style: {
            borderRadius: borderRadius,
            minWidth: size,
            minHeight: size,
            borderWidth: borderWidth,
            borderColor: borderColor,
            ...getRingSpacing(tokens),
            aspectRatio: 1,
          },
        };
      },
      ['borderRadius', 'size', 'borderColor', 'borderWidth', 'ringThickness'],
    ),
    icon: buildProps(
      (tokens: AvatarTokens) => {
        return {
          style: {
            position: 'absolute',
            fontSize: tokens.iconSize || tokens.fontSize,
          },
          ...getIconStyles(tokens),
        };
      },
      ['iconSize', 'iconColor'],
    ),
    fallbackIcon: buildProps(
      (tokens: AvatarTokens) => {
        return getIconStyles(tokens);
      },
      ['iconSize', 'iconColor'],
    ),
    ring: buildProps(
      (tokens: AvatarTokens, theme: Theme) => {
        const { ringColor, ringBackgroundColor } = tokens;
        const ringConfig = getRingConfig(tokens);
        return {
          style: {
            borderStyle: 'solid',
            minWidth: ringConfig.size,
            minHeight: ringConfig.size,
            ...borderStyles.from(tokens, theme),
            borderWidth: ringConfig.ringThickness,
            borderColor: ringColor,
            ...getRingSpacing(tokens),
            backgroundColor: ringBackgroundColor || 'transparent',
            aspectRatio: 1,
          },
        };
      },
      ['size', 'ringColor', 'ringBackgroundColor', 'ringThickness', ...borderStyles.keys],
    ),
    ...(Platform.OS === 'android' && {
      outerRing: buildProps(
        (tokens: AvatarTokens, theme: Theme) => {
          const { ringBackgroundColor } = tokens;
          const ringConfig = getRingConfig(tokens);
          return {
            style: {
              borderStyle: 'solid',
              minWidth: ringConfig.size,
              minHeight: ringConfig.size,
              ...borderStyles.from(tokens, theme),
              backgroundColor: ringBackgroundColor || 'transparent',
            },
          };
        },
        ['size', 'ringColor', 'ringBackgroundColor', 'ringThickness', ...borderStyles.keys],
      ),
    }),
    badge: buildProps(
      (tokens: AvatarTokens) => {
        return {
          size: tokens.badgeSize,
          status: tokens.badgeStatus,
          position: 'absolute',
          outOfOffice: tokens.outOfOffice,
          // badgeX and badgeY, when present, override the default badge position picked from presenceBadge tokens. This check prevents unnecessary overrides.
          right: tokens.badgeX !== undefined ? tokens.badgeX : undefined,
          bottom: tokens.badgeY !== undefined ? tokens.badgeY : undefined,
        };
      },
      ['badgeSize', 'badgeStatus', 'badgeX', 'badgeY', 'outOfOffice'],
    ),
  },
};
