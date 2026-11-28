import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { presenceBadgeStyles, presenceBadgeTokens } from './presence-badge.styles';
import type { PresenceBadgeState } from './presence-badge.types';

export function usePresenceBadgeStyles_unstable(state: PresenceBadgeState) {
  const tokens = getComponentTokens(state, presenceBadgeTokens);
  const { source: svgSource, ...mark } = resolveTokenStates(tokens.mark, state).props;
  attachSlotProps(state.root, { style: [presenceBadgeStyles.root, resolveTokenStates(tokens.root, state).style, state.userStyle] });
  attachSlotProps(state.mark, { ...mark, svgSource });
}
