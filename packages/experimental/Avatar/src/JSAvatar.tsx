/** @jsx withSlots */
import { Image, View, Text } from 'react-native';
import { JSAvatarProps, JSAvatarType, JSAvatarName, JSAvatarState } from './JSAvatar.types';
import { stylingSettings } from './JSAvatar.styling';
import { compose, UseSlots, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { useAvatar } from './useAvatar';
import { PresenceBadge } from '../../Badge';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the avatar.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the avatar
 * @param userProps The props that were passed into the avatar
 * @returns Whether the styles that are assigned to the layer should be applied to the avatar
 */
export const avatarLookup = (layer: string, state: JSAvatarState, userProps: JSAvatarProps): boolean => {
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'circular') ||
    (userProps.active === 'inactive' && layer === 'inactive')
  );
};

export const JSAvatar = compose<JSAvatarType>({
  displayName: JSAvatarName,
  ...stylingSettings,
  slots: {
    root: View,
    photo: Image,
    initials: Text,
    initialsBackground: View,
    icon: Image,
    ring: View,
    glow: View,
  },
  useRender: (userProps: JSAvatarProps, useSlots: UseSlots<JSAvatarType>) => {
    const avatar = useAvatar(userProps);
    const Slots = useSlots(userProps, (layer) => avatarLookup(layer, avatar.state, userProps));

    return (final: JSAvatarProps) => {
      const { children, accessibilityLabel, presence, activeAppearance, isOutOfOffice, ...mergedProps } = mergeProps(avatar.props, final);
      const { personaPhotoSource, showRing, transparentRing } = avatar.state;

      const badgeStyles = {
        bottom: 0,
        right: 0,
      };

      return (
        <Slots.root {...mergedProps}>
          {personaPhotoSource ? (
            <Slots.photo accessibilityLabel={accessibilityLabel} source={personaPhotoSource} />
          ) : (
            <Slots.initialsBackground>
              <Slots.initials>{children}</Slots.initials>
            </Slots.initialsBackground>
          )}
          {showRing && !transparentRing && <Slots.ring />}
          {activeAppearance === 'glow' && <Slots.glow />}
          <PresenceBadge styles={badgeStyles} size="small" presence={presence} isOutOfOffice={isOutOfOffice} />
        </Slots.root>
      );
    };
  },
});
