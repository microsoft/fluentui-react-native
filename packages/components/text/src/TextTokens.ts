import { buildUseTokens } from '@fluentui-react-native/framework';
import { textName, TextTokens } from './Text.types';

export const useTextTokens = buildUseTokens<TextTokens>(
  (t) => ({
    variant: 'secondaryStandard',
    color: t.colors.bodyText,
  }),
  textName,
);
