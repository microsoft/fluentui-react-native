import { JSAvatarName, JSAvatarTokens, AvatarSlotProps, JSAvatarProps } from './JSAvatar.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultJSAvatarTokens } from './JSAvatarTokens';
import { ViewStyle } from 'react-native';
import { convertCoinColorFluent, getRingConfig } from './JSAvatar.helpers';
import { borderStyles } from '@fluentui-react-native/tokens';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

export const avatarStates: (keyof JSAvatarTokens)[] = [
  'circular',
  'square',
  'inactive',
  'size20',
  'size24',
  'size28',
  'size32',
  'size36',
  'size40',
  'size48',
  'size56',
  'size64',
  'size72',
  'size96',
  'size120',
];

export const stylingSettings: UseStylingOptions<JSAvatarProps, AvatarSlotProps, JSAvatarTokens> = {
  tokens: [defaultJSAvatarTokens, JSAvatarName],
  states: avatarStates,
  slotProps: {
    root: buildProps(
      (tokens: JSAvatarTokens) => {
        const { horizontalIconAlignment, verticalIconAlignment } = tokens;
        return {
          style: {
            flexDirection: 'row',
            width: tokens.width,
            height: tokens.height,
            justifyContent: nameMap[horizontalIconAlignment || 'end'] as ViewStyle['justifyContent'],
            alignItems: nameMap[verticalIconAlignment || 'end'] as ViewStyle['alignItems'],
            horizontalIconAlignment,
            verticalIconAlignment,
            opacity: tokens.avatarOpacity,
          },
        };
      },
      ['horizontalIconAlignment', 'verticalIconAlignment', 'avatarOpacity', 'height', 'width'],
    ),
    initials: buildProps(
      (tokens: JSAvatarTokens) => {
        return {
          style: {
            fontSize: tokens.initialsSize,
          },
        };
      },
      ['initialsSize'],
    ),
    initialsBackground: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const { backgroundColor, coinColorFluent } = tokens;
        let effectiveBackgroundColor = backgroundColor;
        if (coinColorFluent) {
          effectiveBackgroundColor = convertCoinColorFluent(coinColorFluent);
        }
        return {
          style: {
            ...borderStyles.from(tokens, theme),
            width: tokens.width,
            height: tokens.height,
            flexGrow: 1,
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: effectiveBackgroundColor,
          },
        };
      },
      ['coinColorFluent', 'backgroundColor', 'width', 'height', ...borderStyles.keys],
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

        const ringColor = tokens.ringColor;
        return {
          style: {
            borderStyle: 'solid',
            borderColor: ringColor,
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
