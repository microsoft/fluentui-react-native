import { StyleSheet } from 'react-native';
import { assetField, defineComponentTokens, getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch, ResolvedSlotTokens } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import { dropdownChevronAssets, parseDropdownChevron } from './dropdown.assets';
import type { DropdownState } from './dropdown.types';
import schema from './spec/tokens.json' with { type: 'json' };

// The hidden row that measures the full selected labels may grow this wide.
const measureWidth = 4096;

export const dropdownStyles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
  },
  trigger: {
    overflow: 'hidden',
  },
  valueBox: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  measure: {
    flexDirection: 'row',
    left: 0,
    opacity: 0,
    position: 'absolute',
    top: 0,
    width: measureWidth,
  },
  measureText: {
    flexShrink: 0,
  },
});

type DropdownAxes = Pick<DropdownState, 'size' | 'open' | 'focusVisible' | 'visualState'>;
const slots = {
  chevron: { style: {}, props: { ...iconTokenProps, source: assetField('fluent-icon', dropdownChevronAssets, parseDropdownChevron) } },
};
type DropdownDomains = typeof slots;
declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.dropdown': ComponentTokenPatch<DropdownAxes, DropdownDomains>;
  }
}
const dropdownTokenDefinition = defineComponentTokens<DropdownAxes, DropdownDomains>({ id: 'furn.dropdown', slots, schema });

export function getDropdownChevron(
  state: DropdownState,
): ResolvedSlotTokens<DropdownDomains['chevron']['style'], DropdownDomains['chevron']['props']>['props'] {
  return resolveTokenStates(getComponentTokens(state, dropdownTokenDefinition).chevron, state).props;
}
