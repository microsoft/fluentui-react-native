import {
  fontBody1,
  fontBody1Strong,
  fontBody2,
  fontBody2Strong,
  fontCaption1,
  fontCaption1Strong,
  fontCaption2,
  fontDisplay,
  fontLargeTitle,
  fontTitle1,
  fontTitle2,
  fontTitle3,
} from '@fluentui-react-native/design/tokens/generated/aliases.android';
import { memoize } from '@fluentui-react-native/framework-base';
import type { Variants } from '@fluentui-react-native/design/theming';

const fontAliasTokens = {
  body1: fontBody1,
  body1Strong: fontBody1Strong,
  body2: fontBody2,
  body2Strong: fontBody2Strong,
  caption1: fontCaption1,
  caption1Strong: fontCaption1Strong,
  caption2: fontCaption2,
  display: fontDisplay,
  largeTitle: fontLargeTitle,
  title1: fontTitle1,
  title2: fontTitle2,
  title3: fontTitle3,
} satisfies Partial<Variants>;

function createFontAliasTokensWorker(): Partial<Variants> {
  return fontAliasTokens;
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
