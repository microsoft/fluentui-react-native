import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { avatarGroupStyles, avatarGroupTokens } from './avatar-group.styles';
import type { AvatarGroupState } from './avatar-group.types';

export function useAvatarGroupStyles_unstable(state: AvatarGroupState) {
  const tokens = getComponentTokens(state, avatarGroupTokens);
  attachSlotProps(state.root, { style: [avatarGroupStyles.root, resolveTokenStates(tokens.root, state).style, state.userStyle] });
  if (state.overflow) {
    attachSlotProps(state.overflow, {
      style: [
        avatarGroupStyles.overflow,
        { minWidth: state.size, minHeight: state.size },
        resolveTokenStates(tokens.overflow, state).style,
      ],
    });
  }
  if (state.count) {
    attachSlotProps(state.count, { style: resolveTokenStates(tokens.count, state).style });
  }
}
