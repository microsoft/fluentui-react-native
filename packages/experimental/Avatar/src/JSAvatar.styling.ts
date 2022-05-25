import { JSAvatarName, JSAvatarTokens, AvatarSlotProps, JSAvatarProps, AvatarColors, AvatarSizesForTokens } from './JSAvatar.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultJSAvatarTokens } from './JSAvatarTokens';
import { ViewStyle } from 'react-native';
import { getRingConfig } from './JSAvatar.helpers';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

export const avatarStates: (keyof JSAvatarTokens)[] = [
  ...AvatarColors,
  ...AvatarSizesForTokens,
  'circular',
  'square',
  'inactive',
  'ringColor',
  'ringBackgroundColor',
  'iconColor',
  'size',
];

export const stylingSettings: UseStylingOptions<JSAvatarProps, AvatarSlotProps, JSAvatarTokens> = {
  tokens: [defaultJSAvatarTokens, JSAvatarName],
  states: avatarStates,
  slotProps: {
    root: buildProps(
      (tokens: JSAvatarTokens) => {
        const { horizontalIconAlignment, verticalIconAlignment, size, avatarOpacity } = tokens;
        return {
          style: {
            flexDirection: 'row',
            width: size,
            height: size,
            justifyContent: nameMap[horizontalIconAlignment || 'end'] as ViewStyle['justifyContent'],
            alignItems: nameMap[verticalIconAlignment || 'end'] as ViewStyle['alignItems'],
            horizontalIconAlignment,
            verticalIconAlignment,
            opacity: avatarOpacity,
          },
        };
      },
      ['horizontalIconAlignment', 'verticalIconAlignment', 'avatarOpacity', 'size'],
    ),
    initials: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        return {
          style: {
            ...fontStyles.from(tokens, theme),
            color: tokens.color,
            textAlign: 'center',
          },
        };
      },
      ['color', ...fontStyles.keys],
    ),
    initialsBackground: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const { backgroundColor, size } = tokens;

        return {
          style: {
            ...borderStyles.from(tokens, theme),
            width: size,
            height: size,
            flexGrow: 1,
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor,
            borderWidth: tokens.borderWidth,
            borderColor: tokens.borderColor,
          },
        };
      },
      ['backgroundColor', 'size', 'borderColor', 'borderWidth', ...borderStyles.keys],
    ),
    image: buildProps(
      (tokens: JSAvatarTokens) => {
        const { borderRadius, size, borderWidth, borderColor } = tokens;
        return {
          style: {
            borderRadius: borderRadius,
            width: size,
            height: size,
            borderWidth: borderWidth,
            borderColor: borderColor,
          },
        };
      },
      ['borderRadius', 'size', 'borderColor', 'borderWidth'],
    ),
    icon: buildProps(
      (tokens: JSAvatarTokens) => {
        return {
          style: {
            position: 'absolute',
            color: tokens.iconColor,
            width: tokens.iconSize,
            height: tokens.iconSize,
          },
        };
      },
      ['iconSize', 'iconColor'],
    ),
    ring: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const ringConfig = getRingConfig(tokens.size);
        return {
          style: {
            borderStyle: 'solid',
            width: ringConfig.size,
            height: ringConfig.size,
            position: 'absolute',
            top: -ringConfig.stroke * 2,
            left: -ringConfig.stroke * 2,
            ...borderStyles.from(tokens, theme),
            borderWidth: ringConfig.stroke,
            borderColor: tokens.ringColor,
          },
        };
      },
      ['size', 'ringColor', ...borderStyles.keys],
    ),
    badge: buildProps(
      (tokens: JSAvatarTokens) => {
        return {
          size: tokens.badgeSize,
          shape: 'circular',
        };
      },
      ['badgeSize'],
    ),
  },
};
