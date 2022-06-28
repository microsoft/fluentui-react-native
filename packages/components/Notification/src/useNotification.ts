import { NotificationProps } from './Notification.types';

export const useNotification = (props: NotificationProps): NotificationProps => {
  const { variant, action, ...rest } = props;

  return {
    variant,
    action,
    ...rest,
  };
};
