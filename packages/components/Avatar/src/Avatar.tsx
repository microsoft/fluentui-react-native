/** @jsxImportSource @fluentui-react-native/framework-base */
import { Fragment } from 'react';
import { Image, View, Text, Platform } from 'react-native';

import { PresenceBadge } from '@fluentui-react-native/badge';
import type { UseSlots, Slots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { Svg, Path } from 'react-native-svg';

import { stylingSettings } from './Avatar.styling';
import type { AvatarProps, AvatarType, AvatarState, AvatarSlotProps } from './Avatar.types';
import { AvatarName } from './Avatar.types';
import { getFallbackIconPath } from './stylingUtils';
import { useAvatar } from './useAvatar';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the avatar.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the avatar
 * @param userProps The props that were passed into the avatar
 * @returns Whether the styles that are assigned to the layer should be applied to the avatar
 */
export const avatarLookup = (layer: string, state: AvatarState, userProps: AvatarProps): boolean => {
  const size = userProps.size;
  const avatarSize = size ? `size${size}` : '';
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'circular') ||
    layer === userProps['avatarColor'] ||
    layer === avatarSize ||
    (userProps.active === 'inactive' && layer === 'inactive')
  );
};

export const Avatar = compose<AvatarType>({
  displayName: AvatarName,
  ...stylingSettings,
  slots: {
    root: View,
    image: Image,
    initials: Text,
    initialsBackground: View,
    icon: Icon,
    ring: View,
    outerRing: View,
    badge: PresenceBadge,
    fallbackIcon: Svg,
  },
  useRender: (userProps: AvatarProps, useSlots: UseSlots<AvatarType>) => {
    const avatar = useAvatar(userProps);
    const Slots = useSlots(avatar.props, (layer) => avatarLookup(layer, avatar.state, avatar.props));

    return (final: AvatarProps) => {
      const { showRing, transparentRing, showBadge } = avatar.state;
      const { badge, ...mergedProps } = avatar.props;
      const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);
      const RingComponent = showRing && !transparentRing ? Slots.ring : Fragment;
      const hasOuterRing = Platform.OS === 'android' && showRing && !transparentRing;

      return (
        <Slots.root {...mergedProps}>
          {hasOuterRing ? (
            <Slots.outerRing>
              <RingComponent>{renderAvatar(final, avatar.props, Slots, svgIconsEnabled)}</RingComponent>
            </Slots.outerRing>
          ) : (
            <RingComponent>{renderAvatar(final, avatar.props, Slots, svgIconsEnabled)}</RingComponent>
          )}
          {svgIconsEnabled && showBadge && <Slots.badge {...badge} />}
        </Slots.root>
      );
    };
  },
});

function renderAvatar(final: AvatarProps, avatarProps: AvatarProps, Slots: Slots<AvatarSlotProps>, svgIconsEnabled?: boolean) {
  const { icon, initials, image } = mergeProps(avatarProps, final);
  return image.source ? (
    <Slots.image {...image} />
  ) : (
    <Slots.initialsBackground accessible={false}>
      {initials ? (
        <Slots.initials accessible={false}>{initials}</Slots.initials>
      ) : avatarProps.icon ? (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - TODO, fix typing error
        <Slots.icon {...icon} accessible={false} />
      ) : (
        svgIconsEnabled && (
          <Slots.fallbackIcon viewBox="0 0 20 20">
            <Path fill="currentColor" d={getFallbackIconPath(avatarProps.avatarColor)}></Path>
          </Slots.fallbackIcon>
        )
      )}
    </Slots.initialsBackground>
  );
}
