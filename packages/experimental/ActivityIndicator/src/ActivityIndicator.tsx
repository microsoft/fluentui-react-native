/** @jsx withSlots */

import { ActivityIndicator as CoreActivityIndicator } from 'react-native';
import { activityIndicatorName, CoreActivityIndicatorType, ActivityIndicatorProps } from './ActivityIndicator.types';
import { coreSizeFromFluentSize, coreStylingSettings } from './ActivityIndicator.styling';
import { compose, withSlots, UseSlots } from '@fluentui-react-native/framework';

export const ActivityIndicator = compose<CoreActivityIndicatorType>({
  displayName: activityIndicatorName,
  ...coreStylingSettings,
  slots: {
    root: CoreActivityIndicator,
  },
  render: (userProps: ActivityIndicatorProps, useSlots: UseSlots<CoreActivityIndicatorType>) => {
    const { size, ...rest } = userProps;
    const props = {
      ...(size && { size: coreSizeFromFluentSize(size) }), // Only pass in the prop if defined
      rest,
    };
    const Slots = useSlots(props);
    return () => <Slots.root />;
  },
});
