import { assetField, defineComponentTokens } from '@fluentui-react-native/design/styling';
import type { CompiledComponentTokens, ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { ButtonSize } from '../button/button.types';
import { fallbackChevronAssets, parseChevronSource } from './chevronAssets';
import schema from './spec/tokens.json' with { type: 'json' };

type ChevronState = { size: ButtonSize };

function chevronSlots(assets: typeof fallbackChevronAssets) {
  return { chevron: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', assets, parseChevronSource) } } };
}

type ChevronSlots = ReturnType<typeof chevronSlots>;
export type MenuButtonTokens = CompiledComponentTokens<ChevronState, ChevronSlots>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.menu-button': ComponentTokenPatch<ChevronState, ChevronSlots>;
  }
}

export function createMenuButtonTokenDefinition(assets: typeof fallbackChevronAssets) {
  return defineComponentTokens<ChevronState, ChevronSlots>({ id: 'furn.menu-button', slots: chevronSlots(assets), schema });
}

export const menuButtonTokenDefinition = createMenuButtonTokenDefinition(fallbackChevronAssets);
