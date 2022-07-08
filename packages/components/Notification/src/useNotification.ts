import { NotificationProps } from './Notification.types';
import { FlexAlignType } from 'react-native';

export const useNotification = (props: NotificationProps): NotificationProps => {
  const { variant, title, action, onPress, ...rest } = props;
  let alignSelf = 'flex-start' as FlexAlignType;
  let marginHorizontal = 16;

  if (['primaryOutlineBar', 'primaryBar', 'neutralBar'].includes(variant)) {
    alignSelf = 'center' as FlexAlignType;
    marginHorizontal = 0;
  }

  return {
    variant,
    title,
    action,
    onPress,
    alignSelf,
    marginHorizontal,
    ...rest,
  };
};
