/** @jsxImportSource @fluentui-react-native/framework-base */
import React from 'react';
import { View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Path, Svg } from 'react-native-svg';

import { stylingSettings } from './Option.styling';
import type { OptionProps, OptionType } from './Option.types';
import { optionName } from './Option.types';
import { useOption } from './useOption';

export const Option = compose<OptionType>({
  displayName: optionName,
  ...stylingSettings,
  slots: {
    root: View,
    checkIcon: Svg,
    label: Text,
  },
  useRender: (userProps: OptionProps, useSlots: UseSlots<OptionType>) => {
    const option = useOption(userProps);
    const Slots = useSlots(userProps, (layer): boolean => option.state[layer] || userProps[layer]);
    return (final: OptionProps, ...children: React.ReactNode[]) => {
      const mergedProps = mergeProps(option.props, final);

      const checkPath = (
        <Path
          d="M14.0458 3.4856C14.3299 3.78703 14.3158 4.26169 14.0144 4.54579L6.08456 12.0197C5.74829 12.3366 5.22042 12.3269 4.89609 11.9977L2.21576 9.27737C1.92504 8.98231 1.92856 8.50745 2.22361 8.21674C2.51867 7.92602 2.99353 7.92954 3.28424 8.22459L5.51839 10.4921L12.9856 3.45421C13.287 3.17011 13.7617 3.18416 14.0458 3.4856Z"
          fill="currentColor"
        />
      );

      // TODO: Handle non-string children
      const label = <Slots.label>{children}</Slots.label>;

      return (
        <Slots.root {...mergedProps}>
          <Slots.checkIcon>{checkPath}</Slots.checkIcon>
          {label}
        </Slots.root>
      );
    };
  },
});
