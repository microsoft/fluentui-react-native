/** @jsx withSlots */
import { notification, NotificationType, NotificationProps } from './Notification.types';
import { Pressable } from '@fluentui-react-native/pressable';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { stylingSettings } from './Notification.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the Notification.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the Notification
 * @returns Whether the styles that are assigned to the layer should be applied to the Notification
 */
export const notificationLookup = (layer: string, userProps: NotificationProps): boolean => {
  return userProps.variant === layer || (layer === 'hasTitle' && userProps.title != undefined);
};

export const Notification = compose<NotificationType>({
  displayName: notification,
  ...stylingSettings,
  slots: {
    root: Pressable,
    contentContainer: View,
    title: Text,
    message: Text,
    action: Button,
  },
  useRender: (userProps: NotificationProps, useSlots: UseSlots<NotificationType>) => {
    const Slots = useSlots(userProps, (layer) => notificationLookup(layer, userProps));

    return (final: NotificationProps, ...children: React.ReactNode[]) => {
      const { variant, title, action, ...mergedProps } = mergeProps(userProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.contentContainer>
            {title && <Slots.title>{title}</Slots.title>}
            <Slots.message>{children}</Slots.message>
          </Slots.contentContainer>
          {action && <Slots.action>{action}</Slots.action>}
        </Slots.root>
      );
    };
  },
});
