import { NotificationProps } from './Notification.types';

export const useNotification = (props: NotificationProps): NotificationProps => {
  const { variant, endText, ...rest } = props;

  return {
    variant,
    endText,
    ...rest,
  };
};
