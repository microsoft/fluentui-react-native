/** @jsx withSlots */
import { View } from 'react-native';
import { SeparatorProps, SeparatorTokens, SeparatorType } from './Separator.types';
import { compose, UseSlots, buildProps, withSlots, mergeProps } from '@fluentui-react-native/framework';

export const separatorName = 'Separator';
const propMask = { vertical: undefined };

export const Separator = compose<SeparatorType>({
  displayName: separatorName,
  tokens: [{ separatorWidth: 1 }, separatorName],
  tokensThatAreAlsoProps: ['vertical'],
  slotProps: {
    root: buildProps(
      (tokens: SeparatorTokens) => ({
        style: {
          ...(tokens.vertical ? { borderLeftWidth: tokens.separatorWidth } : { borderTopWidth: tokens.separatorWidth }),
          ...(tokens.color && { borderColor: tokens.color }),
        },
      }),
      ['color', 'vertical', 'separatorWidth'],
    ),
  },
  slots: { root: View },
  render: (props: SeparatorProps, useSlots: UseSlots<SeparatorType>) => {
    const Root = useSlots(props).root;
    return (rest: SeparatorProps, children: React.ReactNode) => <Root {...mergeProps(props, rest, propMask)}>{children}</Root>;
  },
});

export default Separator;
