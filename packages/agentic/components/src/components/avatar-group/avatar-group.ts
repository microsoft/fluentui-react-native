import type { AvatarGroupProps } from './avatar-group.types';
import { renderAvatarGroup_unstable } from './renderAvatarGroup';
import { useAvatarGroup_unstable } from './useAvatarGroup';
import { useAvatarGroupStyles_unstable } from './useAvatarGroupStyles';

export const AvatarGroup = (props: AvatarGroupProps) => {
  const state = useAvatarGroup_unstable(props);
  useAvatarGroupStyles_unstable(state);
  return renderAvatarGroup_unstable(state);
};

AvatarGroup.displayName = 'AvatarGroup';
