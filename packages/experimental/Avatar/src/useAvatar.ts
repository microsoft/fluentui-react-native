import { AvatarProps, AvatarInfo, AvatarState } from './Avatar.types';
import { getPresenceIconSource } from './Avatar.helpers';

/**
 * Re-usable hook for FURN Avatar.
 * This hook configures Avatar props and state for FURN Avatar.
 *
 * @param props user props sent to FURN Avatar
 * @returns configured props and state for FURN Avatar
 */
export const useAvatar = (props: AvatarProps): AvatarInfo => {
  const { imageUrl, imageDescription, initials, presence, isOutOfOffice, ring, ...rest } = props;

  const personaPhotoSource =
    imageUrl === undefined
      ? undefined
      : {
          uri: imageUrl,
        };

  const iconSource = presence === undefined ? undefined : getPresenceIconSource(presence, isOutOfOffice || false);
  const showRing = !!ring;
  const transparentRing = !!ring?.transparent;

  const state: AvatarState = {
    iconSource,
    personaPhotoSource,
    showRing,
    transparentRing,
  };

  return {
    props: {
      children: initials,
      accessibilityLabel: imageDescription,
      ...rest,
    },
    state: {
      ...state,
    },
  };
};
