import { JSAvatarProps, AvatarInfo, JSAvatarState } from './JSAvatar.types';
import { getPresenceIconSource } from './JSAvatar.helpers';

/**
 * Re-usable hook for FURN Avatar.
 * This hook configures Avatar props and state for FURN Avatar.
 *
 * @param props user props sent to FURN Avatar
 * @returns configured props and state for FURN Avatar
 */
export const useAvatar = (props: JSAvatarProps): AvatarInfo => {
  const { imageUrl, imageDescription, initials, presence, isOutOfOffice, ring, shape, active, activeAppearance, ...rest } = props;

  const personaPhotoSource =
    imageUrl === undefined
      ? undefined
      : {
          uri: imageUrl,
        };

  const iconSource = presence === undefined ? undefined : getPresenceIconSource(presence, isOutOfOffice || false);
  const showRing = active === 'active' && activeAppearance === 'ring';
  const transparentRing = !!ring?.transparent;

  const state: JSAvatarState = {
    iconSource,
    personaPhotoSource,
    showRing,
    transparentRing,
  };

  return {
    props: {
      children: initials,
      accessibilityLabel: imageDescription,
      shape: shape || 'circular',
      ...rest,
      active,
      activeAppearance,
    },
    state: {
      ...state,
    },
  };
};
