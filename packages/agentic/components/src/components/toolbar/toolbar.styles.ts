import { alignItemsToken, defineComponentTokens, flexDirectionToken, getGapStyleValue } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { ToolbarState } from './toolbar.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<ToolbarState, 'size'>;
const slots = {
  root: { style: { flexDirection: flexDirectionToken, alignItems: alignItemsToken, gap: getGapStyleValue }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.toolbar': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const toolbarTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.toolbar', slots, schema });
