/** @jsx withSlots */
import { View } from 'react-native';
import { SeparatorProps, SeparatorTokens, SeparatorType } from './Separator.types';
import { compose, mergeProps, UseSlots, withSlots } from '@fluentui-react-native/framework';

import { buildProps } from '@fluentui-react-native/use-styling';

export const separatorName = 'Separator';

export const Separator = compose<SeparatorType>({
  displayName: separatorName,
  tokens: [{ separatorWidth: 1 }, separatorName],
  tokensThatAreAlsoProps: ['vertical'],
  slotProps: {
    root: buildProps(
      (tokens: SeparatorTokens) => ({
        style: {
          borderLeftWidth: (tokens.vertical && tokens.separatorWidth) || undefined,
          borderTopWidth: (!tokens.vertical && tokens.separatorWidth) || undefined,
          ...(tokens.color && { borderColor: tokens.color }),
        },
      }),
      ['color', 'vertical', 'separatorWidth'],
    ),
  },
  slots: { root: View },
  render: (props: SeparatorProps, useSlots: UseSlots<SeparatorType>) => {
    const Root = useSlots(props).root;
    return (extra: SeparatorProps, ...children: React.ReactNode[]) => {
      const merged = mergeProps(props, extra, { vertical: undefined });
      return <Root {...merged}>{children}</Root>;
    };
  },
});

export default Separator;
