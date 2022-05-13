import { Variants } from '@fluentui-react-native/theme-types';
import { Text } from './Text';
import { createFontAliasTokens } from '@fluentui-react-native/win32-theme';

const variantsWin32: Partial<Variants> = createFontAliasTokens('light');

export const Caption1 = Text.customize({
  fontFamily: variantsWin32.caption1.face,
  fontSize: variantsWin32.caption1.size,
  fontWeight: variantsWin32.caption1.weight,
});
export const Body1 = Text.customize({
  fontFamily: variantsWin32.body1.face,
  fontSize: variantsWin32.body1.size,
  fontWeight: variantsWin32.body1.weight,
});
export const Body1Strong = Text.customize({
  fontFamily: variantsWin32.body1Strong.face,
  fontSize: variantsWin32.body1Strong.size,
  fontWeight: variantsWin32.body1Strong.weight,
});
export const Body2 = Text.customize({
  fontFamily: variantsWin32.body2.face,
  fontSize: variantsWin32.body2.size,
  fontWeight: variantsWin32.body2.weight,
});
export const Body2Strong = Text.customize({
  fontFamily: variantsWin32.body2Strong.face,
  fontSize: variantsWin32.body2Strong.size,
  fontWeight: variantsWin32.body2Strong.weight,
});
export const Subtitle1 = Text.customize({
  fontFamily: variantsWin32.subtitle1.face,
  fontSize: variantsWin32.subtitle1.size,
  fontWeight: variantsWin32.subtitle1.weight,
});
export const Subtitle1Strong = Text.customize({
  fontFamily: variantsWin32.subtitle1Strong.face,
  fontSize: variantsWin32.subtitle1Strong.size,
  fontWeight: variantsWin32.subtitle1Strong.weight,
});
export const Subtitle2 = Text.customize({
  fontFamily: variantsWin32.subtitle2.face,
  fontSize: variantsWin32.subtitle2.size,
  fontWeight: variantsWin32.subtitle2.weight,
});
export const Subtitle2Strong = Text.customize({
  fontFamily: variantsWin32.subtitle2Strong.face,
  fontSize: variantsWin32.subtitle2Strong.size,
  fontWeight: variantsWin32.subtitle2Strong.weight,
});
export const Title1 = Text.customize({
  fontFamily: variantsWin32.title1.face,
  fontSize: variantsWin32.title1.size,
  fontWeight: variantsWin32.title1.weight,
});
export const Title1Strong = Text.customize({
  fontFamily: variantsWin32.title1Strong.face,
  fontSize: variantsWin32.title1Strong.size,
  fontWeight: variantsWin32.title1Strong.weight,
});
export const LargeTitle = Text.customize({
  fontFamily: variantsWin32.largeTitle.face,
  fontSize: variantsWin32.largeTitle.size,
  fontWeight: variantsWin32.largeTitle.weight,
});
export const Display = Text.customize({
  fontFamily: variantsWin32.display.face,
  fontSize: variantsWin32.display.size,
  fontWeight: variantsWin32.display.weight,
});
