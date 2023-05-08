import { usePressableState } from '@fluentui-react-native/interactive-hooks';

import type { DrawerV1Props, DrawerV1Info } from './DrawerV1.types';

export const useDrawerV1 = (props: DrawerV1Props): DrawerV1Info => {
  const { onBlur, onFocus, accessibilityLabel, ...rest } = props;
  const pressable = usePressableState({ onBlur, onFocus });

  return {
    props: {
      ...pressable.props,
      ...rest,
    },
    state: { ...pressable.state, text: '' },
  };
};
