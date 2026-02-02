import { View } from 'react-native';

import { mergeProps, phasedComponent, directComponent } from '@fluentui-react-native/framework-base';

import type { OverflowProps } from './Overflow.types';
import { overflowName } from './Overflow.types';
import { useOverflow } from './useOverflow';
import { OverflowContext } from '../OverflowContext';

export const Overflow = phasedComponent<OverflowProps>((initial: OverflowProps) => {
  const { props, state } = useOverflow(initial);
  return directComponent<OverflowProps>((final: OverflowProps) => {
    const { children, ...rest } = final;
    const mergedProps = mergeProps(props, rest);
    return (
      <OverflowContext.Provider value={state}>
        <View {...mergedProps}>{children}</View>
      </OverflowContext.Provider>
    );
  });
});
Overflow.displayName = overflowName;

export default Overflow;
