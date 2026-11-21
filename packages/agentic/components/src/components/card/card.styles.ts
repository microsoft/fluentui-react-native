import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  colorToken,
  defineComponentTokens,
  flexDirectionToken,
  getComponentTokens,
  getGapStyleValue,
  numericToken,
  resolveTokenStates,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { CardState } from './card.types';
import schema from './spec/tokens.json' with { type: 'json' };

export const cardStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    flexShrink: 1,
    maxWidth: 720,
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  section: { alignSelf: 'stretch', flexShrink: 1, minWidth: 0 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent', borderStyle: 'solid' },
  nestedContent: { alignSelf: 'stretch', flexShrink: 1, overflow: 'hidden' },
});

const slots = {
  root: {
    style: {
      backgroundColor: colorToken,
      borderColor: colorToken,
      borderRadius: numericToken,
      borderWidth: numericToken,
      flexDirection: flexDirectionToken,
      gap: getGapStyleValue,
      padding: numericToken,
    },
    props: {},
  },
  nestedContent: { style: { backgroundColor: colorToken }, props: {} },
};
type CardTokenState = Pick<CardState, 'size' | 'padding' | 'resolvedDirection' | 'selected'> & {
  visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.card': ComponentTokenPatch<CardTokenState, typeof slots>;
  }
}

const definition = defineComponentTokens<CardTokenState, typeof slots>({ id: 'furn.card', slots, schema });

export function getCardChrome(state: CardState): { root: ViewStyle; nestedContent: ViewStyle } {
  const tokens = getComponentTokens(state, definition);
  const variant: CardTokenState = {
    size: state.size,
    padding: state.padding,
    resolvedDirection: state.resolvedDirection,
    selected: state.selected,
    visualState: !state.isInteractive
      ? 'rest'
      : state.disabled
        ? 'disabled'
        : state.pressed
          ? 'pressed'
          : state.hovered
            ? 'hovered'
            : 'rest',
  };
  return {
    root: resolveTokenStates(tokens.root, variant).style,
    nestedContent: resolveTokenStates(tokens.nestedContent, variant).style,
  };
}
