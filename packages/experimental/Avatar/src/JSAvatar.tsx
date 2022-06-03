/** @jsx withSlots */
import { Image, View, Text, Platform } from 'react-native';
import { JSAvatarProps, JSAvatarType, JSAvatarName, JSAvatarState } from './JSAvatar.types';
import { stylingSettings } from './JSAvatar.styling';
import { compose, UseSlots, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { useAvatar } from './useAvatar';
import { PresenceBadge } from '@fluentui-react-native/badge';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { SvgXml } from 'react-native-svg';

/**
 * A function which determines if a set of styles should be applied to the compoent given the current state and props of the avatar.
 *
 * @param layer The name of the state that is being checked for
 * @param state The current state of the avatar
 * @param userProps The props that were passed into the avatar
 * @returns Whether the styles that are assigned to the layer should be applied to the avatar
 */
export const avatarLookup = (layer: string, state: JSAvatarState, userProps: JSAvatarProps): boolean => {
  const size = userProps.size;
  const avatarSize = size ? `size${size}` : '';
  return (
    state[layer] ||
    userProps[layer] ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'circular') ||
    layer === userProps['avatarColor'] ||
    (!userProps['avatarColor'] && layer === 'neutral') ||
    layer === avatarSize ||
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
    const iconProps = createIconProps(userProps.icon);
    const Slots = useSlots(avatar.props, (layer) => avatarLookup(layer, avatar.state, avatar.props));

    return (final: JSAvatarProps) => {
      const { accessibilityLabel, activeAppearance, icon, initials, image, badge, ...mergedProps } = mergeProps(avatar.props, final);
      const { showRing, transparentRing, showBadge } = avatar.state;
      const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);
      const fallBackIconXml = `<svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 0C4.79086 0 3 1.79086 3 4C3 6.20914 4.79086 8 7 8C9.20914 8 11 6.20914 11 4C11 1.79086 9.20914 0 7 0ZM4 4C4 2.34315 5.34315 1 7 1C8.65685 1 10 2.34315 10 4C10 5.65685 8.65685 7 7 7C5.34315 7 4 5.65685 4 4ZM2.00873 9C0.903151 9 0 9.88687 0 11C0 12.6912 0.83281 13.9663 2.13499 14.7966C3.41697 15.614 5.14526 16 7 16C8.85474 16 10.583 15.614 11.865 14.7966C13.1672 13.9663 14 12.6912 14 11C14 9.89557 13.1045 9.00001 12 9.00001L2.00873 9ZM1 11C1 10.4467 1.44786 10 2.00873 10L12 10C12.5522 10 13 10.4478 13 11C13 12.3088 12.3777 13.2837 11.3274 13.9534C10.2568 14.636 8.73511 15 7 15C5.26489 15 3.74318 14.636 2.67262 13.9534C1.62226 13.2837 1 12.3088 1 11Z" fill="currentColor"/>
      </svg>
      `;
      return (
        <Slots.root {...mergedProps} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
          {image.source ? (
            <Slots.image accessible={false} {...image} />
          ) : (
            <Slots.initialsBackground accessible={false}>
              {initials ? (
                <Slots.initials accessible={false}>{initials}</Slots.initials>
              ) : userProps.icon ? (
                <Slots.icon {...iconProps} accessible={false} />
              ) : (
                <SvgXml xml={fallBackIconXml} />
              )}
            </Slots.initialsBackground>
          )}
          {showRing && !transparentRing && <Slots.ring />}
          {svgIconsEnabled && showBadge && <Slots.badge {...badge} />}
        </Slots.root>
      );
    };
  },
});
