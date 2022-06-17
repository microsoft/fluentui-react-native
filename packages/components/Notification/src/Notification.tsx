/** @jsx withSlots */
import { View } from 'react-native';
import { notification, NotificationType, NotificationProps } from './Notification.types';
import { Text } from '@fluentui-react-native/experimental-text';
import { stylingSettings } from './Notification.styling';
import { compose, mergeProps, withSlots, UseSlots } from '@fluentui-react-native/framework';
import { useNotification } from './useNotification';
/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the Notification.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the Notification
 * @returns Whether the styles that are assigned to the layer should be applied to the Notification
 */
export const notificationLookup = (layer: string, userProps: NotificationProps): boolean => {
  return userProps['variant'] === layer;
};

export const Notification = compose<NotificationType>({
  displayName: notification,
  ...stylingSettings,
  slots: {
    root: View,
    startText: Text,
    endText: Text,
  },
  useRender: (userProps: NotificationProps, useSlots: UseSlots<NotificationType>) => {
    const notificationProps = useNotification(userProps);
    const Slots = useSlots(userProps, (layer) => notificationLookup(layer, userProps));

    return (final: NotificationProps) => {
      const { variant, startText, endText, ...mergedProps } = mergeProps(notificationProps, final);

      return (
        <Slots.root {...mergedProps}>
          <Slots.startText>{startText}</Slots.startText>
          <Slots.endText>{endText}</Slots.endText>
        </Slots.root>
      );
    };
  },
});
