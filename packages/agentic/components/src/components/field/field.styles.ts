import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  assetField,
  colorToken,
  defineComponentTokens,
  flexDirectionToken,
  fontWeightToken,
  getGapStyleValue,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import { fieldAssets, parseFieldAsset } from './field.assets';
import type { FieldState } from './field.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<FieldState, 'orientation' | 'status' | 'size'>;
const bodyStyle = {
  color: colorToken,
  fontFamily: stringToken,
  fontWeight: fontWeightToken,
  fontSize: numericToken,
  lineHeight: numericToken,
};
const rowStyle = { flexDirection: flexDirectionToken, alignItems: alignItemsToken, gap: getGapStyleValue };
const slots = {
  root: { style: rowStyle, props: {} },
  controlColumn: { style: { flexShrink: numericToken, gap: getGapStyleValue }, props: {} },
  messageStack: { style: { gap: getGapStyleValue }, props: {} },
  helper: { style: bodyStyle, props: {} },
  validationRow: { style: rowStyle, props: {} },
  validationText: { style: { ...bodyStyle, flexShrink: numericToken }, props: {} },
  validationIcon: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', fieldAssets, parseFieldAsset) } },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.field': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const fieldTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.field', slots, schema });
export const fieldStyles = StyleSheet.create({
  label: { maxWidth: '45%', flexShrink: 1, minWidth: 0 },
  controlColumn: { minWidth: 0 },
  horizontalControl: { flex: 1 },
});
