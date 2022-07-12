/** @jsx withSlots */
import { notification, NotificationType, NotificationProps } from './Notification.types';
import { Pressable } from '@fluentui-react-native/pressable';
import { PressableProps, View, ViewStyle } from 'react-native';
import { Icon } from '@fluentui-react-native/icon';
import { Text } from '@fluentui-react-native/experimental-text';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { stylingSettings } from './Notification.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useMemo } from 'react';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { Svg, Path } from 'react-native-svg';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the Notification.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the Notification
 * @returns Whether the styles that are assigned to the layer should be applied to the Notification
 */
export const notificationLookup = (layer: string, userProps: NotificationProps): boolean => {
  return (
    layer === userProps.variant ||
    (layer === 'hasTitle' && userProps.title != undefined) ||
    (layer === 'isBar' && ['primaryOutlineBar', 'primaryBar', 'neutralBar'].includes(userProps.variant))
  );
};

export const Notification = compose<NotificationType>({
  displayName: notification,
  ...stylingSettings,
  slots: {
    root: Pressable,
    icon: Icon,
    contentContainer: View,
    title: Text,
    message: Text,
    action: Button,
    actionText: Text,
    dismissIcon: Svg,
  },
  useRender: (userProps: NotificationProps, useSlots: UseSlots<NotificationType>) => {
    const Slots = useSlots(userProps, (layer) => notificationLookup(layer, userProps));
    const isBar = ['primaryOutlineBar', 'primaryBar', 'neutralBar'].includes(userProps.variant);
    const rootStyle: ViewStyle = useMemo(() => {
      const marginHorizontal = isBar ? 0 : 16;
      return { marginHorizontal: marginHorizontal };
    }, ['isBar']);
    const messageStyle: ViewStyle = useMemo(() => {
      const alignSelf = isBar ? 'center' : 'flex-start';
      return { alignSelf: alignSelf };
    }, ['isBar']);

    return (final: NotificationProps, ...children: React.ReactNode[]) => {
      const { variant, icon, title, action, ...rest } = mergeProps(userProps, final);
      const iconProps = createIconProps(icon);
      const mergedProps = mergeProps<PressableProps>(rest, rootStyle);

      return (
        <Slots.root {...mergedProps}>
          {icon && <Slots.icon {...iconProps} />}
          <Slots.contentContainer>
            {title && <Slots.title>{title}</Slots.title>}
            <Slots.message style={messageStyle}>{children}</Slots.message>
          </Slots.contentContainer>
          {!isBar && (
            <Slots.action>
              {action ? <Slots.actionText>{action}</Slots.actionText> : <Slots.dismissIcon>{getDismissIconPath()}</Slots.dismissIcon>}
            </Slots.action>
          )}
        </Slots.root>
      );
    };
  },
});

function getDismissIconPath() {
  const path =
    'M3.89705 4.05379L3.96967 3.96967C4.23594 3.7034 4.6526 3.6792 4.94621 3.89705L5.03033 3.96967L10 8.939L14.9697 3.96967C15.2359 3.7034 15.6526 3.6792 15.9462 3.89705L16.0303 3.96967C16.2966 4.23594 16.3208 4.6526 16.1029 4.94621L16.0303 5.03033L11.061 10L16.0303 14.9697C16.2966 15.2359 16.3208 15.6526 16.1029 15.9462L16.0303 16.0303C15.7641 16.2966 15.3474 16.3208 15.0538 16.1029L14.9697 16.0303L10 11.061L5.03033 16.0303C4.76406 16.2966 4.3474 16.3208 4.05379 16.1029L3.96967 16.0303C3.7034 15.7641 3.6792 15.3474 3.89705 15.0538L3.96967 14.9697L8.939 10L3.96967 5.03033C3.7034 4.76406 3.6792 4.3474 3.89705 4.05379L3.96967 3.96967L3.89705 4.05379Z';
  return <Path fill="currentColor" d={path}></Path>;
}
