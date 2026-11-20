import { defineComponentTokens } from '@fluentui-react-native/design/styling';
import type { CompiledComponentTokens, ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/tokenFields';
import { buttonSizeAxis } from '../button/button.styles';
import schema from './spec/tokens.json' with { type: 'json' };

const axes = [buttonSizeAxis] as const;
const slots = { chevron: { style: {}, props: iconTokenProps } };

export type MenuButtonTokens = CompiledComponentTokens<typeof axes, typeof slots>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.menu-button': ComponentTokenPatch<typeof axes, typeof slots>;
  }
}

export const menuButtonTokenDefinition = defineComponentTokens({ id: 'furn.menu-button', axes, slots, schema });
