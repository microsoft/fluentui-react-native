import {
  AvatarName,
  AvatarTokens,
  AvatarConfigurableProps,
  AvatarSlotProps,
  AvatarProps,
  AvatarColors,
  AvatarSizesForTokens,
  AvatarNamedColor,
  ColorSchemes,
  AvatarColorSchemes,
} from './Avatar.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultAvatarTokens } from './AvatarTokens';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const avatarStates: (keyof AvatarTokens)[] = [
  ...AvatarColors,
  ...AvatarSizesForTokens,
  'neutral',
  'brand',
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
            backgroundColor: ringBackgroundColor || 'transparent',
            borderColor: ringColor,
            aspectRatio: 1,
          },
        };
      },
      ['size', 'ringColor', 'ringBackgroundColor', 'ringThickness', ...borderStyles.keys],
    ),
    badge: buildProps(
      (tokens: AvatarTokens) => {
        return {
          size: tokens.badgeSize,
          status: tokens.badgeStatus,
          position: 'absolute',
          outOfOffice: tokens.outOfOffice,
        };
      },
      ['badgeSize', 'badgeStatus'],
    ),
  },
};

function getRingConfig(tokens: AvatarTokens): any {
  const { size, ringThickness } = tokens;
  const SMALL_SIZE = 48;
  const MEDIUM_SIZE = 71;
  const innerGap = tokens.ringInnerGap || ringThickness;

  const strokeSize = {
    small: globalTokens.stroke.width20,
    medium: globalTokens.stroke.width30,
    large: globalTokens.stroke.width40,
  };
  if (ringThickness) {
    return {
      size: size + ringThickness * 2 + innerGap * 2,
      ringThickness,
      innerGap,
    };
  } else {
    if (size <= SMALL_SIZE) {
      return {
        size: size + strokeSize.small * 4,
        ringThickness: strokeSize.small,
        innerGap: strokeSize.small,
      };
    }
    if (size <= MEDIUM_SIZE) {
      return {
        size: size + strokeSize.medium * 4,
        ringThickness: strokeSize.medium,
        innerGap: strokeSize.medium,
      };
    }
    return {
      size: size + strokeSize.large * 4,
      ringThickness: strokeSize.large,
      innerGap: strokeSize.large,
    };
  }
}

function getIconStyles(tokens: AvatarTokens) {
  return {
    color: tokens.iconColor || tokens.color,
    width: tokens.iconSize,
    height: tokens.iconSize,
  };
}

function getRingSpacing(tokens: AvatarTokens) {
  const ringConfig = getRingConfig(tokens);
  return tokens.active === 'active'
    ? {
        marginTop: ringConfig.innerGap,
        marginLeft: ringConfig.innerGap,
      }
    : {};
}
