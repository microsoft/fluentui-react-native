import type { ColorValue } from 'react-native';

import type { AvatarNamedColor, AvatarSize } from './Avatar.types';

export interface AvatarSizeTokens {
  badgeSize: number;
  fontSize: number;
  iconSize: number;
  ringGap: number;
  ringThickness: number;
  size: AvatarSize;
  squareRadius: number;
}

export interface AvatarColorTokens {
  backgroundColor: ColorValue;
  foregroundColor: ColorValue;
  ringColor: ColorValue;
}

export const avatarSizeTokens: Readonly<Record<AvatarSize, AvatarSizeTokens>> = {
  16: { badgeSize: 6, fontSize: 10, iconSize: 12, ringGap: 1, ringThickness: 1, size: 16, squareRadius: 2 },
  20: { badgeSize: 6, fontSize: 10, iconSize: 16, ringGap: 1, ringThickness: 1, size: 20, squareRadius: 2 },
  24: { badgeSize: 8, fontSize: 10, iconSize: 16, ringGap: 1, ringThickness: 1, size: 24, squareRadius: 2 },
  28: { badgeSize: 8, fontSize: 12, iconSize: 20, ringGap: 2, ringThickness: 2, size: 28, squareRadius: 4 },
  32: { badgeSize: 10, fontSize: 14, iconSize: 20, ringGap: 2, ringThickness: 2, size: 32, squareRadius: 4 },
  36: { badgeSize: 10, fontSize: 14, iconSize: 20, ringGap: 2, ringThickness: 2, size: 36, squareRadius: 4 },
  40: { badgeSize: 12, fontSize: 14, iconSize: 20, ringGap: 2, ringThickness: 2, size: 40, squareRadius: 4 },
  48: { badgeSize: 12, fontSize: 16, iconSize: 24, ringGap: 2, ringThickness: 2, size: 48, squareRadius: 6 },
  56: { badgeSize: 16, fontSize: 16, iconSize: 28, ringGap: 3, ringThickness: 2, size: 56, squareRadius: 6 },
  64: { badgeSize: 20, fontSize: 20, iconSize: 32, ringGap: 3, ringThickness: 2, size: 64, squareRadius: 8 },
  72: { badgeSize: 20, fontSize: 20, iconSize: 32, ringGap: 3, ringThickness: 3, size: 72, squareRadius: 8 },
  96: { badgeSize: 28, fontSize: 20, iconSize: 48, ringGap: 4, ringThickness: 3, size: 96, squareRadius: 12 },
  120: { badgeSize: 32, fontSize: 24, iconSize: 48, ringGap: 4, ringThickness: 4, size: 120, squareRadius: 12 },
  128: { badgeSize: 32, fontSize: 24, iconSize: 48, ringGap: 4, ringThickness: 4, size: 128, squareRadius: 12 },
};

const named = (backgroundColor: ColorValue, foregroundColor: ColorValue, ringColor: ColorValue): AvatarColorTokens => ({
  backgroundColor,
  foregroundColor,
  ringColor,
});

export const avatarNamedColorTokens: Readonly<Record<AvatarNamedColor, AvatarColorTokens>> = {
  darkRed: named('#f1bbbc', '#590815', '#c50f1f'),
  cranberry: named('#eeacb2', '#6e0811', '#c50f1f'),
  red: named('#f6d1d3', '#750b1c', '#d13438'),
  pumpkin: named('#f9d9bb', '#712d09', '#ca5010'),
  peach: named('#ffddb3', '#8f4e00', '#ff8c00'),
  marigold: named('#f9e2ae', '#6b3a00', '#eaa300'),
  gold: named('#ecdfa5', '#6c5700', '#c19c00'),
  brass: named('#e0cea2', '#553e06', '#986f0b'),
  brown: named('#ddc3b0', '#50301a', '#8e562e'),
  forest: named('#bdd99b', '#294903', '#498205'),
  seafoam: named('#a8f0cd', '#00723b', '#00cc6a'),
  darkGreen: named('#9ad29a', '#063b06', '#0b6a0b'),
  lightTeal: named('#a6e9ed', '#00666d', '#00b7c3'),
  teal: named('#9bd9db', '#02494c', '#038387'),
  steel: named('#c1d6e0', '#15395b', '#4f6bed'),
  blue: named('#a9d3f2', '#004377', '#0078d4'),
  royalBlue: named('#c6d1ff', '#002c76', '#4f6bed'),
  cornflower: named('#c8d1fa', '#2c3c85', '#4f6bed'),
  navy: named('#a3b5d9', '#001f45', '#0027b4'),
  lavender: named('#d2ccf8', '#3f3682', '#7160e8'),
  purple: named('#c6b1de', '#341a51', '#5c2e91'),
  grape: named('#d9a7e0', '#4c0d55', '#881798'),
  lilac: named('#e6bfed', '#63276d', '#b146c2'),
  pink: named('#f7c0e3', '#80215d', '#e43ba6'),
  magenta: named('#eca5d1', '#6b0043', '#bf0077'),
  plum: named('#d696c0', '#43002b', '#77004d'),
  beige: named('#d7c9b9', '#4d3b2a', '#7a7574'),
  mink: named('#cecccb', '#343131', '#5d5a58'),
  platinum: named('#d7d7d7', '#3b3a39', '#7a7574'),
  anchor: named('#bcc3c7', '#202427', '#394146'),
  burgundy: named('#d9a7a7', '#4a0d0d', '#a4262c'),
  hotPink: named('#f7c0e3', '#7a1f5c', '#e3008c'),
  orchid: named('#e6bfed', '#5b2568', '#8764b8'),
};
