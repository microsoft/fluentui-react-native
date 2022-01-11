import { JSAvatarName, JSAvatarTokens, AvatarSlotProps, JSAvatarProps } from './JSAvatar.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultJSAvatarTokens } from './JSAvatarTokens';
import { ViewStyle } from 'react-native';
import { calculateEffectiveSizes, convertCoinColorFluent, getRingConfig } from './JSAvatar.helpers';
import { borderStyles } from '@fluentui-react-native/tokens';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

export const avatarStates: (keyof JSAvatarTokens)[] = ['circular', 'square', 'inactive'];

export const stylingSettings: UseStylingOptions<JSAvatarProps, AvatarSlotProps, JSAvatarTokens> = {
  tokens: [defaultJSAvatarTokens, JSAvatarName],
  states: avatarStates,
  slotProps: {
    root: buildProps(
      (tokens: JSAvatarTokens) => {
        const { physicalSize } = calculateEffectiveSizes(tokens);
        const { horizontalIconAlignment, verticalIconAlignment } = tokens;
        return {
          style: {
            flexDirection: 'row',
            width: physicalSize,
            height: physicalSize,
            justifyContent: nameMap[horizontalIconAlignment || 'end'] as ViewStyle['justifyContent'],
            alignItems: nameMap[verticalIconAlignment || 'end'] as ViewStyle['alignItems'],
            horizontalIconAlignment,
            verticalIconAlignment,
            opacity: tokens.avatarOpacity,
          },
        };
      },
      ['horizontalIconAlignment', 'verticalIconAlignment', 'avatarOpacity'],
    ),
    initials: buildProps(
      (tokens: JSAvatarTokens) => {
        const { initialsSize } = calculateEffectiveSizes(tokens);
        return {
          style: {
            fontSize: initialsSize,
          },
        };
      },
      ['initialsSize'],
    ),
    initialsBackground: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const { physicalSize } = calculateEffectiveSizes(tokens);
        const { backgroundColor, coinColorFluent } = tokens;
        let effectiveBackgroundColor = backgroundColor;
        if (coinColorFluent) {
          effectiveBackgroundColor = convertCoinColorFluent(coinColorFluent);
        }
        return {
          style: {
            ...borderStyles.from(tokens, theme),
            width: physicalSize,
            height: physicalSize,
            flexGrow: 1,
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: effectiveBackgroundColor,
          },
        };
      },
      ['coinColorFluent', 'backgroundColor', 'physicalSize', ...borderStyles.keys],
    ),
    photo: buildProps(
      (tokens: JSAvatarTokens) => {
        const { physicalSize } = calculateEffectiveSizes(tokens);

        return {
          style: {
            borderRadius: tokens.borderRadius,
            width: physicalSize,
            height: physicalSize,
          },
        };
      },
      ['physicalSize', 'borderRadius'],
    ),
    icon: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const { iconSize, iconStrokeWidth } = calculateEffectiveSizes(tokens);
        const iconSizeAdjusted = iconSize + iconStrokeWidth * 2;
        const iconStrokeColor = tokens.iconStrokeColor || theme.colors.background;
        return {
          style: {
            position: 'absolute',
            width: iconSizeAdjusted,
            height: iconSizeAdjusted,
            bottom: -iconStrokeWidth,
            end: -iconStrokeWidth,
            borderRadius: iconSizeAdjusted / 2,
            borderWidth: iconStrokeWidth,
            borderColor: iconStrokeColor,
          },
        };
      },
      ['iconSize', 'iconStrokeWidth', 'iconStrokeColor'],
    ),
    ring: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const { physicalSize } = calculateEffectiveSizes(tokens);
        const ringConfig = getRingConfig(physicalSize);

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
      ['physicalSize', 'ring', 'physicalSize', ...borderStyles.keys],
    ),
    glow: buildProps(
      (tokens: JSAvatarTokens, theme: Theme) => {
        const { physicalSize } = calculateEffectiveSizes(tokens);
        const ringConfig = getRingConfig(physicalSize);

        const glowColor = tokens.ringColor;
        return {
          style: {
            borderStyle: 'solid',
            borderColor: glowColor,
            borderWidth: ringConfig.stroke - ringConfig.innerStroke,
            width: ringConfig.size,
            height: ringConfig.size,
            position: 'absolute',
            top: -ringConfig.stroke * 2,
            left: -ringConfig.stroke * 2,
            ...borderStyles.from(tokens, theme),
          },
        };
      },
      ['physicalSize', 'ring', ...borderStyles.keys],
    ),
  },
};
