import { assetField, colorToken, defineComponentTokens, numericToken } from '@fluentui-react-native/design/styling';
import type { CompiledComponentTokens, ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { ButtonSize } from '../button/button.types';
import { chevronAssets, parseChevronSource } from './menu-button.assets';
import schema from './spec/tokens.json' with { type: 'json' };

type MenuButtonTokenState = { size: ButtonSize; highContrast: boolean; open: boolean; disabled: boolean };

const slots = {
  root: { style: { borderColor: colorToken }, props: {} },
  content: { style: { top: numericToken }, props: {} },
  chevron: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', chevronAssets, parseChevronSource) } },
};

type ChevronSlots = typeof slots;
export type MenuButtonTokens = CompiledComponentTokens<MenuButtonTokenState, ChevronSlots>;

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.menu-button': ComponentTokenPatch<MenuButtonTokenState, ChevronSlots>;
  }
}

export const menuButtonTokenDefinition = defineComponentTokens<MenuButtonTokenState, ChevronSlots>({
  id: 'furn.menu-button',
  slots,
  schema,
});
