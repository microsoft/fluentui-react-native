/** @jsxRuntime classic */
/** @jsx withSlots */
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, withSlots, mergeProps } from '@fluentui-react-native/framework';

import { stylingSettings } from './Separator.styling';
import type { SeparatorProps, SeparatorType } from './Separator.types';
import { separatorName } from './Separator.types';

const propMask = { vertical: undefined };

export const Separator = compose<SeparatorType>({
  displayName: separatorName,
  ...stylingSettings,
  slots: { root: View },
  useRender: (props: SeparatorProps, useSlots: UseSlots<SeparatorType>) => {
    const Root = useSlots(props).root;
    return (rest: SeparatorProps, children: React.ReactNode) => <Root {...mergeProps(props, rest, propMask)}>{children}</Root>;
  },
});

export default Separator;
