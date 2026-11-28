import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  justifyContentToken,
  numericToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { SwatchState } from './swatch.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<SwatchState, 'size' | 'shape' | 'selected' | 'visualState'>;
const slots = {
  root: {
    style: { width: dimensionToken, height: dimensionToken, alignItems: alignItemsToken, justifyContent: justifyContentToken },
    props: {},
  },
  sample: { style: { width: dimensionToken, height: dimensionToken, borderRadius: dimensionToken }, props: {} },
  boundary: { style: { borderWidth: numericToken, borderColor: colorToken }, props: {} },
  indicator: { style: { backgroundColor: colorToken, borderRadius: dimensionToken }, props: iconTokenProps },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.swatch': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const swatchTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.swatch', slots, schema });
export const swatchStyles = StyleSheet.create({
  root: { flexShrink: 0 },
  sample: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  indicator: { alignItems: 'center', justifyContent: 'center' },
});
