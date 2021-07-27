/** @jsx withSlots */
import * as React from 'react';
import { nativePipsPagerName, PipsPagerType, PipsPagerViewProps } from './PipsPager.types';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';
import { WinUI } from 'react-native-xaml';

export const PipsPager = compose<PipsPagerType>({
  displayName: nativePipsPagerName,
  tokens: [{}, nativePipsPagerName],
  slotProps: {
    root: buildProps(
      (tokens) => ({
        ...tokens,
      }),
    ),
  },
  slots: { root: WinUI.PipsPager },
  render: (userProps: WinUI.PipsPagerProps, useSlots: UseSlots<PipsPagerType>) => {
    const Root = useSlots(userProps).root;
    return (rest: PipsPagerViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(userProps, rest)}>{children}</Root>;
  },
});

// export const PipsPager: React.FC<WinUI.PipsPagerProps> = (props: WinUI.PipsPagerProps) => {
//   return (
//       <WinUI.PipsPager {...props} />
//   );
// };