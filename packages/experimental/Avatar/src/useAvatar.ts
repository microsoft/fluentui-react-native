import { JSAvatarProps, AvatarInfo, JSAvatarState } from './JSAvatar.types';
import { ImageProps, ImageSourcePropType } from 'react-native';
import { PresenceBadgeProps } from '@fluentui-react-native/badge';
/**
 * Re-usable hook for FURN Avatar.
 * This hook configures Avatar props and state for FURN Avatar.
 *
 * @param props user props sent to FURN Avatar
 * @returns configured props and state for FURN Avatar
 */
export const useAvatar = (props: JSAvatarProps): AvatarInfo => {
  const { active, accessibilityLabel, activeAppearance, badge, src, initials, ring, shape, ...rest } = props;

  const showRing = active === 'active' && activeAppearance === 'ring';
  const transparentRing = !!ring?.transparent;

  const imageProps: ImageProps = {
    accessibilityLabel,
    source: src ? ({ uri: src } as ImageSourcePropType) : undefined,
  };

  const badgeProps: PresenceBadgeProps = {
    size: 'small',
    ...badge,
  };

  const state: JSAvatarState = {
    showRing,
    transparentRing,
  };

  return {
    props: {
      children: initials,
      shape: shape || 'circular',
      ...rest,
      active,
      activeAppearance,
      image: imageProps,
      badge: badgeProps,
    },
    state: {
      ...state,
    },
  };
};
