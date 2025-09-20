/** @jsxImportSource @fluentui-react-native/framework-base */

import { ActivityIndicator as CoreActivityIndicator } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';

import { coreStylingSettings } from './ActivityIndicator.styling';
import type { CoreActivityIndicatorType, ActivityIndicatorProps } from './ActivityIndicator.types';
import { activityIndicatorName } from './ActivityIndicator.types';

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
  useRender: (props: ActivityIndicatorProps, useSlots: UseSlots<CoreActivityIndicatorType>) => {
    const Slots = useSlots(props);
    return () => <Slots.root />;
  },
});
