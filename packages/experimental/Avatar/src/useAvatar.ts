import { JSAvatarProps, AvatarInfo, JSAvatarState } from './JSAvatar.types';
/**
 * Re-usable hook for FURN Avatar.
 * This hook configures Avatar props and state for FURN Avatar.
 *
 * @param props user props sent to FURN Avatar
 * @returns configured props and state for FURN Avatar
 */
export const useAvatar = (props: JSAvatarProps): AvatarInfo => {
  const { imageUrl, imageDescription, initials, isOutOfOffice, presence, ring, shape, active, activeAppearance, ...rest } = props;

  const personaPhotoSource =
    imageUrl === undefined
      ? undefined
      : {
          uri: imageUrl,
        };

  const showRing = active === 'active' && activeAppearance === 'ring';
  const transparentRing = !!ring?.transparent;

  const state: JSAvatarState = {
    personaPhotoSource,
    showRing,
    transparentRing,
  };

  return {
    props: {
      isOutOfOffice: isOutOfOffice || false,
      presence: presence || 'available',
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
