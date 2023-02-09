import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { RingConfig, AvatarTokens } from './Avatar.types';

export function getRingConfig(tokens: AvatarTokens): RingConfig {
  const { size } = tokens;
  let { ringThickness } = tokens;
  let innerGap = tokens.ringInnerGap || ringThickness;

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
      ringThickness = strokeSize.small;
      innerGap = strokeSize.small;
    } else if (size <= 20) {
      ringThickness = strokeSize.small;
      innerGap = strokeSize.medium;
    } else if (size <= LARGE_SIZE) {
      ringThickness = strokeSize.medium;
      innerGap = strokeSize.medium;
    } else {
      ringThickness = strokeSize.large;
      innerGap = strokeSize.large;
    }
    return {
      ringThickness,
      innerGap,
      size: size + ringThickness * 2 + innerGap * 2,
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

export function getFallbackIconPath() {
  return 'M7 0C4.79086 0 3 1.79086 3 4C3 6.20914 4.79086 8 7 8C9.20914 8 11 6.20914 11 4C11 1.79086 9.20914 0 7 0ZM2.00873 9C0.903151 9 0 9.88687 0 11C0 12.6912 0.83281 13.9663 2.13499 14.7966C3.41697 15.614 5.14526 16 7 16C8.85474 16 10.583 15.614 11.865 14.7966C13.1672 13.9663 14 12.6912 14 11C14 9.89557 13.1045 9.00001 12 9.00001L2.00873 9Z';
}
