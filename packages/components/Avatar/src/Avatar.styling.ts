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
  'initialsColor',
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
            width: avatarSize,
            height: avatarSize,
            opacity: avatarOpacity,
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
        const ringConfig = getRingConfig(tokens);

        return {
          style: {
            ...borderStyles.from(tokens, theme),
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: _avatarColor,
            borderWidth: tokens.borderWidth,
            borderColor: tokens.borderColor,
            marginTop: ringConfig.ringThickness,
            marginLeft: ringConfig.ringThickness,
          },
        };
      },
      ['avatarColor', 'backgroundColor', 'size', 'borderColor', 'borderWidth', 'ringThickness', ...borderStyles.keys],
    ),
    image: buildProps(
      (tokens: AvatarTokens) => {
        const { borderRadius, size, borderWidth, borderColor } = tokens;
        const ringConfig = getRingConfig(tokens);
        return {
          style: {
            borderRadius: borderRadius,
            width: size,
            height: size,
            borderWidth: borderWidth,
            borderColor: borderColor,
            marginTop: ringConfig.ringThickness,
            marginLeft: ringConfig.ringThickness,
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
            width: ringConfig.size,
            height: ringConfig.size,
            ...borderStyles.from(tokens, theme),
            borderWidth: ringConfig.ringThickness,
            backgroundColor: ringBackgroundColor || 'transparent',
            borderColor: ringColor,
          },
        };
      },
      ['size', 'ringColor', 'ringBackgroundColor', 'ringThickness', ...borderStyles.keys],
    ),
    badge: buildProps(
      (tokens: AvatarTokens) => {
        return {
          size: tokens.badgeSize,
          shape: 'circular',
        };
      },
      ['badgeSize'],
    ),
  },
};

function getRingConfig(tokens: AvatarTokens): any {
  const { size, ringThickness } = tokens;
  const SMALL_SIZE = 48;
  const MEDIUM_SIZE = 71;

  const strokeSize = {
    small: globalTokens.stroke.width.thick,
    medium: globalTokens.stroke.width.thicker,
    large: globalTokens.stroke.width.thickest,
  };
  if (ringThickness) {
    return {
      size: size + ringThickness * 4,
      ringThickness,
      innerStroke: ringThickness,
    };
  } else {
    if (size <= SMALL_SIZE) {
      return {
        size: size + strokeSize.small * 4,
        ringThickness: strokeSize.small,
        innerStroke: strokeSize.small,
      };
    }
    if (size <= MEDIUM_SIZE) {
      return {
        size: size + strokeSize.medium * 4,
        ringThickness: strokeSize.medium,
        innerStroke: strokeSize.medium,
      };
    }
    return {
      size: size + strokeSize.large * 4,
      ringThickness: strokeSize.large,
      innerStroke: strokeSize.large,
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
