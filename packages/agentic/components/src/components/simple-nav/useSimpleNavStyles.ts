import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { simpleNavStyles, simpleNavTokens } from './simple-nav.styles';
import type { SimpleNavState } from './simple-nav.types';

export function useSimpleNavStyles_unstable(state: SimpleNavState) {
  const tokens = getComponentTokens(state, simpleNavTokens);
  attachSlotProps(state.root, { style: state.userStyle });
  attachSlotProps(state.panel, { style: resolveTokenStates(tokens.panel, state).style });
  const { flexShrink, ...body } = resolveTokenStates(tokens.body, state).style;
  attachSlotProps(state.body, { style: { flexShrink }, contentContainerStyle: [body, state.rail && simpleNavStyles.narrowInsets] });
  if (state.header)
    attachSlotProps(state.header, {
      style: [
        resolveTokenStates(tokens.header, state).style,
        state.rail && simpleNavStyles.narrowInsets,
        state.rail && simpleNavStyles.center,
      ],
    });
  if (state.footer) attachSlotProps(state.footer, { style: resolveTokenStates(tokens.footer, state).style });
}
