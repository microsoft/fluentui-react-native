import { IViewProps } from '@fluentui-react-native/adapters';
import { ButtonV1 as Button, ButtonProps } from '@fluentui-react-native/button';
import { buildUseTokens, compressible, useSlot, UseTokens } from '@fluentui-react-native/framework';
import React from 'react';
import { View } from 'react-native';
import { Svg, SvgProps } from 'react-native-svg';
import { DropdownProps, DropdownTokens } from './Dropdown.types';

export const Dropdown = compressible<DropdownProps, DropdownTokens>((props: DropdownProps, _useTokens: UseTokens<DropdownTokens>) => {
  const RootSlot = useSlot<IViewProps>(View, props);
  const ButtonSlot = useSlot<ButtonProps>(Button, {});
  const ExpandIconSlot = useSlot<SvgProps>(Svg, {});

  return (_final: DropdownProps, ..._children: React.ReactNode[]) => {
    return (
      <RootSlot>
        <ButtonSlot>
          {'Test'}
          <ExpandIconSlot />
        </ButtonSlot>
      </RootSlot>
    );
  };
}, buildUseTokens<DropdownTokens>({}));
