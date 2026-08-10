import type { AvatarSize } from '../Avatar';

export interface AvatarGroupSizeTokens {
  indicatorBorderWidth: number;
  indicatorFontSize: number;
  pieDividerWidth: number;
  size: AvatarSize;
  spreadGap: number;
  stackOverlap: number;
}

export const avatarGroupSizeTokens: Readonly<Record<AvatarSize, AvatarGroupSizeTokens>> = {
  16: { indicatorBorderWidth: 1, indicatorFontSize: 10, pieDividerWidth: 2, size: 16, spreadGap: 12, stackOverlap: 4 },
  20: { indicatorBorderWidth: 1, indicatorFontSize: 10, pieDividerWidth: 2, size: 20, spreadGap: 10, stackOverlap: 4 },
  24: { indicatorBorderWidth: 1, indicatorFontSize: 10, pieDividerWidth: 2, size: 24, spreadGap: 10, stackOverlap: 8 },
  28: { indicatorBorderWidth: 1, indicatorFontSize: 12, pieDividerWidth: 2, size: 28, spreadGap: 10, stackOverlap: 8 },
  32: { indicatorBorderWidth: 1, indicatorFontSize: 14, pieDividerWidth: 2, size: 32, spreadGap: 16, stackOverlap: 8 },
  36: { indicatorBorderWidth: 2, indicatorFontSize: 14, pieDividerWidth: 2, size: 36, spreadGap: 16, stackOverlap: 8 },
  40: { indicatorBorderWidth: 2, indicatorFontSize: 14, pieDividerWidth: 2, size: 40, spreadGap: 16, stackOverlap: 8 },
  48: { indicatorBorderWidth: 2, indicatorFontSize: 16, pieDividerWidth: 2, size: 48, spreadGap: 16, stackOverlap: 12 },
  56: { indicatorBorderWidth: 3, indicatorFontSize: 16, pieDividerWidth: 3, size: 56, spreadGap: 16, stackOverlap: 12 },
  64: { indicatorBorderWidth: 3, indicatorFontSize: 20, pieDividerWidth: 3, size: 64, spreadGap: 20, stackOverlap: 12 },
  72: { indicatorBorderWidth: 4, indicatorFontSize: 20, pieDividerWidth: 4, size: 72, spreadGap: 20, stackOverlap: 12 },
  96: { indicatorBorderWidth: 4, indicatorFontSize: 20, pieDividerWidth: 4, size: 96, spreadGap: 20, stackOverlap: 20 },
  120: { indicatorBorderWidth: 4, indicatorFontSize: 24, pieDividerWidth: 4, size: 120, spreadGap: 20, stackOverlap: 20 },
  128: { indicatorBorderWidth: 4, indicatorFontSize: 24, pieDividerWidth: 4, size: 128, spreadGap: 20, stackOverlap: 20 },
};
