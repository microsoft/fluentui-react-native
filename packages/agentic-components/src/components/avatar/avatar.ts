import type { AvatarProps } from './avatar.types';
import { useAvatar_unstable } from './useAvatar';
import { useAvatarStyles_unstable } from './useAvatarStyles';
import { renderAvatar_unstable } from './renderAvatar';

export const Avatar = (props: AvatarProps) => {
  const state = useAvatar_unstable(props);
  useAvatarStyles_unstable(state);
  return renderAvatar_unstable(state);
};

Avatar.displayName = 'Avatar';

export default Avatar;
