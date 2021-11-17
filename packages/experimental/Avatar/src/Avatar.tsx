/** @jsx withSlots */
import { Image, View, Text } from 'react-native';
import { AvatarProps, AvatarType, avatarName } from './Avatar.types';
import { stylingSettings } from './Avatar.styling';
import { compose, UseSlots, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { useAvatar } from './useAvatar';

export const Avatar = compose<AvatarType>({
  displayName: avatarName,
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
  render: (userProps: AvatarProps, useSlots: UseSlots<AvatarType>) => {
    const Avatar = useAvatar(userProps);
    const Slots = useSlots(userProps, (layer) => Avatar.state[layer] || userProps[layer]);

    return (final: AvatarProps) => {
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
