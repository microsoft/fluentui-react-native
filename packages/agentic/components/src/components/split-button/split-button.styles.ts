import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  alignSelfToken,
  assetField,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import { chevronAssets, parseChevronSource } from '../menu-button/menu-button.assets';
import type { SplitButtonState } from './split-button.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<SplitButtonState, 'size' | 'appearance'> & { visualState: SplitButtonState['primary']['visualState'] };
const slots = {
  root: { style: { flexDirection: flexDirectionToken, alignItems: alignItemsToken, minHeight: dimensionToken }, props: {} },
  divider: { style: { width: dimensionToken, alignSelf: alignSelfToken, backgroundColor: colorToken }, props: {} },
  menuRegion: { style: { minWidth: dimensionToken }, props: {} },
  chevron: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', chevronAssets, parseChevronSource) } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.split-button': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const splitButtonTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.split-button', slots, schema });
export const splitPrimaryCorners = { borderTopEndRadius: 0, borderBottomEndRadius: 0 };
export const splitTriggerCorners = { borderTopStartRadius: 0, borderBottomStartRadius: 0 };
export const splitButtonStyles = StyleSheet.create({
  root: { alignSelf: 'flex-start', maxWidth: '100%' },
  primary: { alignSelf: 'stretch', flexShrink: 1, ...splitPrimaryCorners },
  trigger: { alignSelf: 'stretch', ...splitTriggerCorners },
});
