import { StyleSheet } from 'react-native';
import { defineComponentTokens, dimensionToken, getGapStyleValue, numericToken } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { SpinButtonState } from './spin-button.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<SpinButtonState, 'visualState'>;
const slots = {
  stepColumn: { style: { width: dimensionToken, gap: getGapStyleValue }, props: {} },
  stepIcon: { style: {}, props: iconTokenProps },
  editor: { style: { flexGrow: numericToken, minWidth: dimensionToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.spin-button': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const spinButtonTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.spin-button', slots, schema });
export const spinButtonStyles = StyleSheet.create({
  editor: { minWidth: 96, alignSelf: 'stretch' },
});
