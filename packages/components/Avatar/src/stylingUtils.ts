import { globalTokens } from '@fluentui-react-native/theme-tokens';

import type { RingConfig, AvatarTokens, AvatarColor } from './Avatar.types';

export function getRingConfig(tokens: AvatarTokens): RingConfig {
  const { size } = tokens;
  let { ringThickness } = tokens;
  let innerGap = tokens.ringInnerGap || ringThickness;

  const SMALL_SIZE = 48;
  const MEDIUM_SIZE = 71;
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
      ringThickness = strokeSize.small;
      innerGap = strokeSize.small;
    } else if (size <= MEDIUM_SIZE) {
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
        marginTop: ringConfig.innerGap,
        marginLeft: ringConfig.innerGap,
      }
    : {};
}

// Mobile has filled and unfilled icons for different Avatars, the avatarColor prop is used to determine which icon to use.
// Not required for other platforms.
export function getFallbackIconPath(_avatarColor?: AvatarColor) {
  return 'M10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2ZM7 6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6C13 7.65685 11.6569 9 10 9C8.34315 9 7 7.65685 7 6ZM5.00873 11C3.90315 11 3 11.8869 3 13C3 14.6912 3.83281 15.9663 5.13499 16.7966C6.41697 17.614 8.14526 18 10 18C11.8547 18 13.583 17.614 14.865 16.7966C16.1672 15.9663 17 14.6912 17 13C17 11.8956 16.1045 11 15 11L5.00873 11ZM4 13C4 12.4467 4.44786 12 5.00873 12L15 12C15.5522 12 16 12.4478 16 13C16 14.3088 15.3777 15.2837 14.3274 15.9534C13.2568 16.636 11.7351 17 10 17C8.26489 17 6.74318 16.636 5.67262 15.9534C4.62226 15.2837 4 14.3088 4 13Z';
}
