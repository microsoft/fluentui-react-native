import { useAsPressable } from '@fluentui-react-native/interactive-hooks';
import * as React from 'react';
import { OptionProps, OptionState } from './Option.types';

export const useOption = (props: OptionProps): OptionState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onPress, componentRef = defaultComponentRef, disabled, ...rest } = props;

  const pressable = useAsPressable({ ...rest, disabled, onPress });

  return {
    props: {
      ...pressable.props,
    },
    state: pressable.state,
  };
};
