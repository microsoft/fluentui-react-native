/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ViewStyle, ViewProps } from 'react-native';
import { useWindowDimensions, View } from 'react-native';

import type { SizeClassIOS } from '@fluentui-react-native/experimental-appearance-additions';
import { useHorizontalSizeClass } from '@fluentui-react-native/experimental-appearance-additions';
import { Shadow } from '@fluentui-react-native/experimental-shadow';
import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, memoize } from '@fluentui-react-native/framework';
import { Icon, createIconProps } from '@fluentui-react-native/icon';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { Pressable } from '@fluentui-react-native/pressable';
import { Body2, Body2Strong } from '@fluentui-react-native/text';

import { NotificationButton, createNotificationButtonProps } from './Notification.helper';
import { stylingSettings } from './Notification.styling';
import type { NotificationType, NotificationProps } from './Notification.types';
import { notification } from './Notification.types';

/**
 * A function which determines if a set of styles should be applied to the component given the current state and props of the Notification.
 *
 * @param layer The name of the state that is being checked for
 * @param userProps The props that were passed into the Notification
 * @returns Whether the styles that are assigned to the layer should be applied to the Notification
 */
export const notificationLookup = (layer: string, userProps: NotificationProps): boolean => {
  return (
    layer === userProps.variant || (layer === 'isBar' && ['primaryOutlineBar', 'primaryBar', 'neutralBar'].includes(userProps.variant))
  );
};

export const Notification = compose<NotificationType>({
  displayName: notification,
  ...stylingSettings,
  slots: {
    root: Pressable,
    icon: Icon,
    contentContainer: View,
    title: Body2Strong,
    message: Body2,
    action: NotificationButton,
    shadow: Shadow,
  },
  useRender: (userProps: NotificationProps, useSlots: UseSlots<NotificationType>) => {
    const Slots = useSlots(userProps, (layer) => notificationLookup(layer, userProps));
    const isBar = ['primaryOutlineBar', 'primaryBar', 'neutralBar'].includes(userProps.variant);
    const width = useWindowDimensions().width / 2;
    const sizeClass = useHorizontalSizeClass();
    const onActionPress = userProps.onActionPress;

    const rootStyle = getRootStyle(isBar, width, sizeClass);
    const messageStyle = getMessageStyle(onActionPress);

    return (final: NotificationProps, ...children: React.ReactNode[]) => {
      const { variant, icon, title, action, onActionPress, ...rest } = mergeProps(userProps, final);
      const mergedProps = mergeProps(rest, rootStyle);
      const iconProps = createIconProps(icon);
      const notificationButtonProps = createNotificationButtonProps(userProps);

      return (
        <Slots.shadow>
          <Slots.root {...mergedProps}>
            {icon && <Slots.icon {...iconProps} accessible={false} />}
            <Slots.contentContainer accessible={true}>
              {title ? <Slots.title>{title}</Slots.title> : null}
              <Slots.message style={messageStyle}>{children}</Slots.message>
            </Slots.contentContainer>
            {onActionPress && <Slots.action {...notificationButtonProps} />}
          </Slots.root>
        </Slots.shadow>
      );
    };
  },
});

const getRootStyle = memoize(getRootStyleWorker);
function getRootStyleWorker(isBar: boolean, width: number, sizeClass: SizeClassIOS): ViewProps {
  const marginHorizontal = isBar ? 0 : 16;
  if (sizeClass === 'regular' && !isBar) {
    return { style: { alignSelf: 'center', marginHorizontal: marginHorizontal, width: width } };
  } else {
    return { style: { marginHorizontal: marginHorizontal } };
  }
}

const getMessageStyle = memoize(getMessageStyleWorker);
function getMessageStyleWorker(onActionPress: (e: InteractionEvent) => void): ViewStyle {
  const alignSelf = onActionPress ? 'flex-start' : 'center';
  return { alignSelf: alignSelf };
}
