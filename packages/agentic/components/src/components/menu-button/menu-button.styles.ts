import { defineComponentTokens } from '@fluentui-react-native/design/styling';
import type { CompiledComponentTokens, ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { ButtonSize } from '../button/button.types';
import schema from './spec/tokens.json' with { type: 'json' };

const slots = { chevron: { style: {}, props: iconTokenProps } };
type ChevronState = { size: ButtonSize };

export type MenuButtonTokens = CompiledComponentTokens<ChevronState, typeof slots>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.menu-button': ComponentTokenPatch<ChevronState, typeof slots>;
  }
}

export const menuButtonTokenDefinition = defineComponentTokens<ChevronState, typeof slots>({ id: 'furn.menu-button', slots, schema });
