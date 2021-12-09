/** @jsx withSlots */

import { ActivityIndicator as CoreActivityIndicator } from 'react-native';
import { activityIndicatorName, CoreActivityIndicatorType, ActivityIndicatorProps } from './ActivityIndicator.types';
import { coreStylingSettings } from './ActivityIndicator.styling';
import { compose, withSlots, UseSlots } from '@fluentui-react-native/framework';

/**
 * Wrapper around React Native Core's ActivityIndicator for platforms we do not
 * have a custom FluentUI React Native ActivityIndicator defined.
 */
export const ActivityIndicator = compose<CoreActivityIndicatorType>({
  displayName: activityIndicatorName,
  ...coreStylingSettings,
  slots: {
    root: CoreActivityIndicator,
  },
  render: (props: ActivityIndicatorProps, useSlots: UseSlots<CoreActivityIndicatorType>) => {
    const Slots = useSlots(props);
    return () => <Slots.root />;
  },
});
