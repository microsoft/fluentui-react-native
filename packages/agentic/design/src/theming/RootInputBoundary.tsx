import * as React from 'react';
import { View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';

import { useRootInputController } from './rootInputController';
import { useRootInputProps } from './useRootInputProps';

/**
 * Attaches a native popup/window to the existing scene's input controller,
 * without introducing another theme or modality context.
 */
export const RootInputBoundary = React.forwardRef<View, IViewProps>((props, ref) => {
  const controller = useRootInputController();
  const inputProps = useRootInputProps(props, controller, true);
  return <View collapsable={false} {...props} {...inputProps} ref={ref} />;
});

RootInputBoundary.displayName = 'RootInputBoundary';
