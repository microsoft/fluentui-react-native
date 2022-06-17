import { NotificationProps } from './Notification.types';

export const useNotification = (props: NotificationProps): NotificationProps => {
  const { variant, startText, endText, ...rest } = props;

  return {
    variant,
    startText,
    endText,
    ...rest,
  };
};
