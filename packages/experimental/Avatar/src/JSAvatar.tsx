/** @jsx withSlots */
import { Image, View, Text } from 'react-native';
import { JSAvatarProps, JSAvatarType, JSAvatarName } from './JSAvatar.types';
import { stylingSettings } from './JSAvatar.styling';
import { compose, UseSlots, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { useAvatar } from './useAvatar';

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
  render: (userProps: JSAvatarProps, useSlots: UseSlots<JSAvatarType>) => {
    const Avatar = useAvatar(userProps);
    const Slots = useSlots(userProps, (layer) => Avatar.state[layer] || userProps[layer]);

    return (final: JSAvatarProps) => {
      const { children, accessibilityLabel, ...mergedProps } = mergeProps(Avatar.props, final);
      const { personaPhotoSource, iconSource, showRing, transparentRing } = Avatar.state;

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
          {showRing && <Slots.glow />}
          {!!iconSource && !!iconSource.uri && <Slots.icon source={iconSource} />}
        </Slots.root>
      );
    };
  },
});
