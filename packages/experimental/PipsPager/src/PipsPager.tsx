/** @jsx withSlots */
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
    return (rest: PipsPagerViewProps) => <Root {...mergeProps(userProps, rest)}/>;
  },
});
