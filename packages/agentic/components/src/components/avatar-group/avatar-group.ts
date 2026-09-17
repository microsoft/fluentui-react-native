import type { AvatarGroupProps } from './avatar-group.types';
import { useAvatarGroup_unstable } from './useAvatarGroup';
import { useAvatarGroupStyles_unstable } from './useAvatarGroupStyles';
import { renderAvatarGroup_unstable } from './renderAvatarGroup';

export const AvatarGroup = (props: AvatarGroupProps) => {
  const state = useAvatarGroup_unstable(props);
  useAvatarGroupStyles_unstable(state);
  return renderAvatarGroup_unstable(state);
};

AvatarGroup.displayName = 'AvatarGroup';

export default AvatarGroup;
