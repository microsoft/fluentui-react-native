import { I18nManager, StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  dimensionToken,
  fontWeightToken,
  getComponentTokens,
  getGapStyleValue,
  numericToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { AccordionState } from './accordion.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const accordionStyles = StyleSheet.create({
  root: { alignSelf: 'stretch', width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start' },
  title: { minWidth: 0 },
  chevronContainer: { alignItems: 'center', flexShrink: 0, justifyContent: 'center' },
  body: { alignSelf: 'stretch' },
  bodyContent: { alignSelf: 'stretch' },
  bodyPlaceholder: { flexShrink: 1 },
  expandedBody: { opacity: 1, overflow: 'visible' },
  collapsedBody: { display: 'none', height: 0, opacity: 0, overflow: 'hidden', paddingHorizontal: 0, paddingTop: 0 },
});

const typography = {
  color: colorToken,
  fontFamily: stringToken,
  fontSize: numericToken,
  fontWeight: fontWeightToken,
  lineHeight: numericToken,
};
const slots = {
  header: {
    style: {
      borderRadius: dimensionToken,
      gap: getGapStyleValue,
      paddingHorizontal: dimensionToken,
      paddingVertical: dimensionToken,
      backgroundColor: colorToken,
    },
    props: {},
  },
  title: { style: { ...typography, flexBasis: dimensionToken, flexGrow: numericToken, flexShrink: numericToken }, props: {} },
  body: { style: { paddingHorizontal: dimensionToken, paddingTop: dimensionToken }, props: {} },
  bodyPlaceholder: { style: typography, props: {} },
  chevronContainer: { style: { marginStart: dimensionToken }, props: {} },
  icon: { style: {}, props: iconTokenProps },
};
type AccordionTokenState = Pick<AccordionState, 'layout'> & { visualState: 'rest' | 'hovered' | 'pressed' };

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.accordion': ComponentTokenPatch<AccordionTokenState, typeof slots>;
  }
}

const definition = defineComponentTokens<AccordionTokenState, typeof slots>({ id: 'furn.accordion', slots, schema });

export function getAccordionChrome(state: AccordionState): {
  header: ViewStyle;
  title: TextStyle;
  body: ViewStyle;
  bodyPlaceholder: TextStyle;
  chevronContainer: ViewStyle;
  icon: Pick<IconElementProps, 'color' | 'height' | 'width'>;
} {
  const tokens = getComponentTokens(state, definition);
  const variant: AccordionTokenState = {
    layout: state.layout,
    visualState: state.pressed ? 'pressed' : state.hovered ? 'hovered' : 'rest',
  };
  return {
    header: resolveTokenStates(tokens.header, variant).style,
    title: resolveTokenStates(tokens.title, variant).style,
    body: resolveTokenStates(tokens.body, variant).style,
    bodyPlaceholder: resolveTokenStates(tokens.bodyPlaceholder, variant).style,
    chevronContainer: resolveTokenStates(tokens.chevronContainer, variant).style,
    icon: resolveTokenStates(tokens.icon, variant).props,
  };
}

export function getAccordionChevronRotationStyle({ layout, expanded }: AccordionState): ViewStyle {
  const rotate = layout === 'chevronEnd' ? (expanded ? '-90deg' : '90deg') : expanded ? '90deg' : I18nManager.isRTL ? '180deg' : '0deg';
  return { transform: [{ rotate }] };
}
