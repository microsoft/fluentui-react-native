import { StyleSheet } from 'react-native';
import { colorToken, defineComponentTokens, dimensionToken, getGapStyleValue, numericToken } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { SliderState } from './slider.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<SliderState, 'orientation' | 'size' | 'visualState'>;
const visual = { width: dimensionToken, height: dimensionToken, borderRadius: numericToken, backgroundColor: colorToken };
const slots = {
  root: { style: { gap: getGapStyleValue }, props: {} },
  rail: { style: visual, props: {} },
  track: { style: visual, props: {} },
  thumb: { style: visual, props: {} },
  hitTarget: { style: { width: numericToken, height: numericToken }, props: {} },
  mark: { style: visual, props: {} },
  label: { style: { color: colorToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.slider': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const sliderTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.slider', slots, schema });
export const sliderStyles = StyleSheet.create({
  horizontal: { minWidth: 120, justifyContent: 'center' },
  vertical: { minHeight: 120, alignItems: 'center' },
  rail: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  layer: { position: 'absolute' },
  thumb: { alignItems: 'center', justifyContent: 'center' },
  nativeTarget: { ...StyleSheet.absoluteFillObject },
});
