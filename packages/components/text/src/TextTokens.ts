import { buildUseTokens } from '@fluentui-react-native/framework';
import { textName, TextTokens } from './Text.types';

export const useTextTokens = buildUseTokens<TextTokens>(
  (t) => ({
    color: t.colors.bodyText,
  }),
  textName,
);
