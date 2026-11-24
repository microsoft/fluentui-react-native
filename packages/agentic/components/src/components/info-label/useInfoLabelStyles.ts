import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { infoLabelStyles, infoLabelTokens } from './info-label.styles';
import type { InfoLabelState } from './info-label.types';

export function useInfoLabelStyles_unstable(state: InfoLabelState) {
  const tokens = getComponentTokens(state, infoLabelTokens);
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.root, state).style, state.userStyle] });
  attachSlotProps(state.label, { style: infoLabelStyles.label });
  if (state.help) {
    const { source } = resolveTokenStates(tokens.icon, state).props;
    attachSlotProps(state.help, {
      trigger: { ...resolveTokenStates(tokens.trigger, state).props, ...state.triggerProps, leadingIcon: { svgSource: source } },
      surface: { accessibilityLabel: state.surfaceLabel, style: resolveTokenStates(tokens.surface, state).style },
    });
  }
}
