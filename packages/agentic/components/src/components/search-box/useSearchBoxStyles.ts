import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { searchBoxStyles, searchBoxTokens } from './search-box.styles';
import type { SearchBoxState } from './search-box.types';

export function useSearchBoxStyles_unstable(state: SearchBoxState) {
  const tokens = getComponentTokens(state, searchBoxTokens);
  const { source: svgSource, ...icon } = resolveTokenStates(tokens.searchIcon, state).props;
  attachSlotProps(state.root, { style: [searchBoxStyles.root, state.userStyle] });
  state.input = {
    ...state.input,
    style: searchBoxStyles.input,
    iconStart: { ...icon, svgSource, ...hiddenFromAccessibilityProps },
  };
  if (state.clear) {
    const { style, props } = resolveTokenStates(tokens.clear, state);
    attachSlotProps(state.clear, { ...props, style: [searchBoxStyles.clear, style] });
  }
}
