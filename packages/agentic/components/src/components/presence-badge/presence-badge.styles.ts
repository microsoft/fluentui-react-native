import { StyleSheet } from 'react-native';
import { assetField, colorToken, defineComponentTokens, dimensionToken } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import { parsePresenceAsset, presenceAssets } from './presence-badge.assets';
import type { PresenceBadgeState } from './presence-badge.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<PresenceBadgeState, 'size' | 'status'>;
const slots = {
  root: { style: { backgroundColor: colorToken, borderRadius: dimensionToken, width: dimensionToken, height: dimensionToken }, props: {} },
  mark: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', presenceAssets, parsePresenceAsset) } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.presence-badge': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const presenceBadgeTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.presence-badge', slots, schema });
export const presenceBadgeStyles = StyleSheet.create({ root: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 } });
