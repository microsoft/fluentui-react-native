import { Text } from './Text';

// TODO(#2268): Remove "as any" designations once RN Core properly supports Dynamic Type scaling

export const Caption1 = Text.customize({
  variant: 'caption1',
  dynamicTypeRamp: 'footnote',
} as any);
export const Caption1Strong = Text.customize({
  variant: 'caption1Strong',
  dynamicTypeRamp: 'footnote',
} as any);
export const Caption2 = Text.customize({
  variant: 'caption2',
  dynamicTypeRamp: 'caption1',
} as any);
export const Body1 = Text.customize({
  variant: 'body1',
  dynamicTypeRamp: 'body',
} as any);
export const Body1Strong = Text.customize({
  variant: 'body1Strong',
  dynamicTypeRamp: 'body',
} as any);
export const Body2 = Text.customize({
  variant: 'body2',
  dynamicTypeRamp: 'subheadline',
} as any);
export const Body2Strong = Text.customize({
  variant: 'body2Strong',
  dynamicTypeRamp: 'subheadline',
} as any);
export const Subtitle1 = null; // Not supported on iOS
export const Subtitle1Strong = null; // Not supported on iOS
export const Subtitle2 = null; // Not supported on iOS
export const Subtitle2Strong = null; // Not supported on iOS
export const Title1 = Text.customize({
  variant: 'title1',
  dynamicTypeRamp: 'title1',
} as any);
export const Title1Strong = null; // Not supported on iOS
export const Title2 = Text.customize({
  variant: 'title2',
  dynamicTypeRamp: 'title2',
} as any);
export const Title3 = Text.customize({
  variant: 'title3',
  dynamicTypeRamp: 'title3',
} as any);
export const LargeTitle = Text.customize({
  variant: 'largeTitle',
  dynamicTypeRamp: 'largeTitle',
} as any);
export const Display = Text.customize({
  variant: 'display',
  dynamicTypeRamp: 'largeTitle',
} as any);
