/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import { View } from 'react-native';

import { mergeProps, withSlots, stagedComponent, memoize } from '@fluentui-react-native/framework';

import type { OverflowProps } from './Overflow.types';
import { overflowName } from './Overflow.types';
import { useOverflow } from './useOverflow';
import { OverflowContext } from '../OverflowContext';

// export const Overflow = compose<OverflowType>({
//   displayName: overflowName,
//   ...stylingSettings,
//   slots: {
//     root: View,
//   },
//   useRender: (userProps: OverflowProps, useSlots: UseSlots<OverflowType>) => {
//     const overflow = useOverflow(userProps);
//     const Slots = useSlots(
//       overflow.props,
//       (layer) => layer === 'hidden' && !overflow.props.dontHideBeforeReady && !overflow.state.initialOverflowLayoutDone,
//     );

//     return (final: OverflowProps, ...children: React.ReactNode[]) => {
//       const merged = mergeProps(overflow.props, final) as IViewProps;
//       return (
//         <OverflowContext.Provider value={overflow.state}>
//           <Slots.root {...merged}>{children}</Slots.root>
//         </OverflowContext.Provider>
//       );
//     };
//   },
// });

export const getOverflowStyleProps = memoize(overflowStylePropsWorker);
function overflowStylePropsWorker(dontHideBeforeReady: boolean, initialOverflowLayoutDone: boolean): Partial<OverflowProps> {
  return {
    style: {
      opacity: dontHideBeforeReady || initialOverflowLayoutDone ? 1 : 0,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  };
}

export const Overflow = stagedComponent<OverflowProps>((initial: OverflowProps) => {
  const { props, state } = useOverflow(initial);
  return (final: OverflowProps, ...children: React.ReactNode[]) => {
    const { itemIDs: _, ...mergedProps } = mergeProps(
      props,
      final,
      getOverflowStyleProps(props.dontHideBeforeReady, state.initialOverflowLayoutDone),
    );
    return (
      <OverflowContext.Provider value={state}>
        <View {...mergedProps}>{children}</View>
      </OverflowContext.Provider>
    );
  };
});
Overflow.displayName = overflowName;

export default Overflow;
