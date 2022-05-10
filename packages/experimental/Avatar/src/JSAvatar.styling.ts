import { JSAvatarName, JSAvatarTokens, AvatarSlotProps, JSAvatarProps, AvatarColors, AvatarSizes } from './JSAvatar.types';
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

export const avatarStates: (keyof JSAvatarTokens)[] = [...AvatarColors, ...AvatarSizes, 'circular', 'square', 'inactive'];

export const stylingSettings: UseStylingOptions<JSAvatarProps, AvatarSlotProps, JSAvatarTokens> = {
  tokens: [defaultJSAvatarTokens, JSAvatarName],
  states: avatarStates,
  slotProps: {
    root: buildProps(
      (tokens: JSAvatarTokens) => {
        const { horizontalIconAlignment, verticalIconAlignment, width, height, avatarOpacity } = tokens;
        return {
          style: {
            flexDirection: 'row',
            width: width,
            height: height,
            justifyContent: nameMap[horizontalIconAlignment || 'end'] as ViewStyle['justifyContent'],
            alignItems: nameMap[verticalIconAlignment || 'end'] as ViewStyle['alignItems'],
            horizontalIconAlignment,
            verticalIconAlignment,
            opacity: avatarOpacity,
          },
        };
      },
      ['horizontalIconAlignment', 'verticalIconAlignment', 'avatarOpacity', 'height', 'width'],
    ),
    initials: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        return {
          style: {
            ...fontStyles.from(tokens, theme),
            color: tokens.color,
          },
        };
      },
      ['color', ...fontStyles.keys],
    ),
    initialsBackground: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const { backgroundColor } = tokens;

        return {
          style: {
            ...borderStyles.from(tokens, theme),
            width: tokens.width,
            height: tokens.height,
            flexGrow: 1,
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor,
          },
        };
      },
      ['backgroundColor', 'width', 'height', ...borderStyles.keys],
    ),
    image: buildProps(
      (tokens: JSAvatarTokens) => {
        return {
          style: {
            borderRadius: tokens.borderRadius,
            width: tokens.width,
            height: tokens.height,
          },
        };
      },
      ['borderRadius', 'width', 'height'],
    ),
    icon: buildProps(
      (tokens: JSAvatarTokens) => {
        return {
          style: {
            position: 'absolute',
            width: tokens.iconSize,
            height: tokens.iconSize,
          },
        };
      },
      ['iconSize'],
    ),
    ring: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const ringConfig = getRingConfig(tokens.width);
        return {
          style: {
            borderStyle: 'solid',
            borderWidth: ringConfig.stroke,
            width: ringConfig.size,
            height: ringConfig.size,
            position: 'absolute',
            top: -ringConfig.stroke * 2,
            left: -ringConfig.stroke * 2,
            ...borderStyles.from(tokens, theme),
          },
        };
      },
      ['width', 'height', ...borderStyles.keys],
    ),
    badge: buildProps(
      (tokens: JSAvatarTokens) => {
        return {
          size: tokens.badgeSize,
          shape: 'circular',
        };
      },
      ['size'],
    ),
  },
};
