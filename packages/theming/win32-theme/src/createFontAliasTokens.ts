import { memoize } from '@fluentui-react-native/framework-base';
import {
  fontBody1,
  fontBody1Strong,
  fontBody2,
  fontBody2Strong,
  fontCaption1,
  fontDisplay,
  fontLargeTitle,
  fontSubtitle1,
  fontSubtitle1Strong,
  fontSubtitle2,
  fontSubtitle2Strong,
  fontTitle1,
  fontTitle1Strong,
} from '@fluentui-react-native/design/tokens/generated/aliases';
import type { Variants } from '@fluentui-react-native/design/theming';

const fontAliasTokens = {
  body1: fontBody1,
  body1Strong: fontBody1Strong,
  body2: fontBody2,
  body2Strong: fontBody2Strong,
  caption1: fontCaption1,
  display: fontDisplay,
  largeTitle: fontLargeTitle,
  subtitle1: fontSubtitle1,
  subtitle1Strong: fontSubtitle1Strong,
  subtitle2: fontSubtitle2,
  subtitle2Strong: fontSubtitle2Strong,
  title1: fontTitle1,
  title1Strong: fontTitle1Strong,
} satisfies Partial<Variants>;

function createFontAliasTokensWorker(): Partial<Variants> {
  return fontAliasTokens;
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
