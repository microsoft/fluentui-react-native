import { globalTokens } from '@fluentui-react-native/theme-tokens';

import type { RingConfig, AvatarTokens } from './Avatar.types';

export function getRingConfig(tokens: AvatarTokens): RingConfig {
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

export function getIconStyles(tokens: AvatarTokens) {
  return {
    color: tokens.iconColor || tokens.color,
    width: tokens.iconSize,
    height: tokens.iconSize,
  };
}

export function getRingSpacing(tokens: AvatarTokens) {
  const ringConfig = getRingConfig(tokens);
  return tokens.active === 'active'
    ? {
        marginTop: ringConfig.innerGap,
        marginLeft: ringConfig.innerGap,
      }
    : {};
}
