import { assetField, defineComponentTokens } from '@fluentui-react-native/design/styling';
import type { CompiledComponentTokens, ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { ButtonSize } from '../button/button.types';
import { chevronAssets, parseChevronSource } from './menu-button.assets';
import schema from './spec/tokens.json' with { type: 'json' };

type ChevronState = { size: ButtonSize };

const slots = {
  chevron: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', chevronAssets, parseChevronSource) } },
};

type ChevronSlots = typeof slots;
export type MenuButtonTokens = CompiledComponentTokens<ChevronState, ChevronSlots>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.menu-button': ComponentTokenPatch<ChevronState, ChevronSlots>;
  }
}

export const menuButtonTokenDefinition = defineComponentTokens<ChevronState, ChevronSlots>({ id: 'furn.menu-button', slots, schema });
