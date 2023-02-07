import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { RingConfig, AvatarTokens } from './Avatar.types';

export function getRingConfig(tokens: AvatarTokens): RingConfig {
  const { size, ringThickness } = tokens;
  const innerGap = tokens.ringInnerGap || ringThickness;

  const LARGE_SIZE = 71;
  const strokeSize = {
    small: globalTokens.stroke.width15,
    medium: globalTokens.stroke.width20,
    large: globalTokens.stroke.width40,
  };

  if (ringThickness) {
    return {
      size: size + ringThickness * 2 + innerGap * 2,
      ringThickness,
      innerGap,
    };
  } else {
    if (size <= 16) {
      return {
        size: size + strokeSize.small * 4,
        ringThickness: strokeSize.small,
        innerGap: strokeSize.small,
      };
    }
    if (size <= 20) {
      return {
        size: size + strokeSize.small * 4,
        ringThickness: strokeSize.small,
        innerGap: strokeSize.medium,
      };
    }
    if (size <= LARGE_SIZE) {
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
        margin: ringConfig.innerGap,
      }
    : {};
}
