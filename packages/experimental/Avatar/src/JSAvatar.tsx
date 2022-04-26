/** @jsx withSlots */
import { Image, View, Text } from 'react-native';
import { JSAvatarProps, JSAvatarType, JSAvatarName, JSAvatarState } from './JSAvatar.types';
import { stylingSettings } from './JSAvatar.styling';
import { compose, UseSlots, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { useAvatar } from './useAvatar';
import { PresenceBadge } from '@fluentui-react-native/badge';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';

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
    layer === userProps['size'] ||
    (!userProps['size'] && layer === 'size56') ||
    (userProps.active === 'inactive' && layer === 'inactive')
  );
};

export const JSAvatar = compose<JSAvatarType>({
  displayName: JSAvatarName,
  ...stylingSettings,
  slots: {
    root: View,
    image: Image,
    initials: Text,
    initialsBackground: View,
    icon: Icon,
    ring: View,
    badge: PresenceBadge,
  },
  useRender: (userProps: JSAvatarProps, useSlots: UseSlots<JSAvatarType>) => {
    const avatar = useAvatar(userProps);
    const Slots = useSlots(userProps, (layer) => avatarLookup(layer, avatar.state, userProps));
    const iconProps = createIconProps(userProps.icon);

    return (final: JSAvatarProps) => {
      const { activeAppearance, icon, initials, image, badge, ...mergedProps } = mergeProps(avatar.props, final);
      const { showRing, transparentRing } = avatar.state;

      return (
        <Slots.root {...mergedProps}>
          {image.source ? (
            <Slots.image {...image} />
          ) : initials ? (
            <Slots.initialsBackground>
              <Slots.initials>{initials}</Slots.initials>
            </Slots.initialsBackground>
          ) : (
            <Slots.icon {...iconProps} />
          )}
          {showRing && !transparentRing && <Slots.ring />}
          {badge.status ? <Slots.badge {...badge} /> : null}
        </Slots.root>
      );
    };
  },
});
