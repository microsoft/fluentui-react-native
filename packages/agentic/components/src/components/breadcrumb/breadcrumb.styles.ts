import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
  fontWeightToken,
  getGapStyleValue,
  numericToken,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { BreadcrumbState } from './breadcrumb.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<BreadcrumbState, 'size'>;
const slots = {
  root: { style: { flexDirection: flexDirectionToken, alignItems: alignItemsToken, gap: getGapStyleValue }, props: {} },
  current: {
    style: {
      fontFamily: stringToken,
      fontSize: numericToken,
      lineHeight: numericToken,
      fontWeight: fontWeightToken,
      color: colorToken,
      flexShrink: numericToken,
    },
    props: {},
  },
  separator: { style: {}, props: iconTokenProps },
  overflowButton: { style: { minWidth: dimensionToken }, props: {} },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.breadcrumb': ComponentTokenPatch<TokenState, typeof slots>;
  }
}

export const breadcrumbTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.breadcrumb', slots, schema });
export const breadcrumbStyles = StyleSheet.create({
  root: { minWidth: 0, alignSelf: 'stretch', flexShrink: 1 },
  probe: { position: 'absolute', top: 0, start: 0, width: '100%', opacity: 0, alignItems: 'flex-start' },
  probeLabel: { flexShrink: 0 },
  current: { minWidth: 0, flexShrink: 1 },
  link: { minWidth: 0, flexShrink: 1, alignSelf: 'center' },
  trigger: { alignSelf: 'center' },
  popup: { maxHeight: 220 },
  popupSurface: { width: 224 },
  popupContent: { gap: 4 },
});
