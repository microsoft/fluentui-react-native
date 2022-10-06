import { buildUseTokens, compressible, UseTokens } from '@fluentui-react-native/framework';
import React from 'react';
import { DropdownProps, DropdownTokens } from './Dropdown.types';

export const Dropdown = compressible<DropdownProps, DropdownTokens>((_props: DropdownProps, _useTokens: UseTokens<DropdownTokens>) => {
  return (_final: DropdownProps, ..._children: React.ReactNode[]) => {
    return null;
  };
}, buildUseTokens<DropdownTokens>({}));
