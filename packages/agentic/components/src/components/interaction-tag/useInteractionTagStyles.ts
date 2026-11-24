import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { resolveButtonChrome } from '../button/button.styles';
import { applyButtonChrome } from '../button/useButtonStyles';
import type { ButtonState } from '../button/button.types';
import { interactionTagStyles, interactionTagTokens } from './interaction-tag.styles';
import type { InteractionTagState } from './interaction-tag.types';

export function useInteractionTagStyles_unstable(state: InteractionTagState) {
  const tokens = getComponentTokens(state, interactionTagTokens);
  const rest = { size: state.size, appearance: state.appearance, shape: state.shape, visualState: state.primary.visualState };
  const root = resolveTokenStates(tokens.root, rest).style;
  attachSlotProps(state.root, { style: [interactionTagStyles.root, root, state.userStyle] });
  attachSlotProps(state.divider, { style: resolveTokenStates(tokens.divider, rest).style });
  const applyRegion = (button: ButtonState, isRemove: boolean) => {
    const variant = { ...rest, visualState: button.visualState };
    const base = resolveButtonChrome(button);
    const { color } = resolveTokenStates(tokens.content, variant).style;
    const chrome = resolveTokenStates(tokens.primary, variant).style;
    const corners = isRemove
      ? { borderTopStartRadius: 0, borderBottomStartRadius: 0 }
      : { borderTopEndRadius: 0, borderBottomEndRadius: 0 };
    applyButtonChrome(button, {
      root: {
        ...base.root,
        ...chrome,
        alignSelf: 'stretch',
        borderRadius: root.borderRadius,
        ...corners,
        ...(isRemove ? { ...resolveTokenStates(tokens.remove, variant).style, paddingHorizontal: 0 } : { flexShrink: 1 }),
      },
      content: { ...base.content, color, textAlign: 'auto' },
      icon: { ...base.icon, ...(isRemove && resolveTokenStates(tokens.removeIcon, variant).props), color },
    });
    applyFocusRingStyles(button.FocusRing, button.themeState, root.borderRadius, corners);
    if (button.leadingIcon) attachSlotProps(button.leadingIcon, hiddenFromAccessibilityProps);
  };
  applyRegion(state.primary, false);
  applyRegion(state.remove, true);
}
