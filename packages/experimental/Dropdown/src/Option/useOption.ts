import { useAsPressable } from '@fluentui-react-native/interactive-hooks';

import type { OptionProps, OptionState } from './Option.types';

export const useOption = (props: OptionProps): OptionState => {
  const pressable = useAsPressable(props);

  return pressable;
};
