/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose } from '@fluentui-react-native/framework';
import { mergeProps } from '@fluentui-react-native/framework-base';

import { stylingSettings } from './Separator.styling';
import type { SeparatorProps, SeparatorType } from './Separator.types';
import { separatorName } from './Separator.types';
import { directComponent } from '@fluentui-react-native/framework-base';

const propMask = { vertical: undefined };

export const Separator = compose<SeparatorType>({
  displayName: separatorName,
  ...stylingSettings,
  slots: { root: View },
  useRender: (props: SeparatorProps, useSlots: UseSlots<SeparatorType>) => {
    const Root = useSlots(props).root;
    return directComponent(({ children, ...rest }: SeparatorProps) => <Root {...mergeProps(props, rest, propMask)}>{children}</Root>);
  },
});

export default Separator;
