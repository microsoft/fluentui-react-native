/** @jsxImportSource @fluentui-react-native/framework-base */
import React from 'react';
import { View } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { ICalloutProps } from '@fluentui-react-native/callout';
import { Callout } from '@fluentui-react-native/callout';
import type { UseTokens } from '@fluentui-react-native/framework';
import { buildUseTokens, compressible, useSlot } from '@fluentui-react-native/framework';

import type { ListboxProps, ListboxTokens } from './Listbox.types';
import { listboxName } from './Listbox.types';

const Listbox = compressible<ListboxProps, ListboxTokens>((props: ListboxProps, _useTokens: UseTokens<ListboxTokens>) => {
  const innerViewProps = React.useMemo(() => ({}), []);

  const RootSlot = useSlot<ICalloutProps>(Callout, props);
  const ContainerSlot = useSlot<IViewProps>(View, innerViewProps);

  return (_final: ListboxProps, ...children: React.ReactNode[]) => {
    return (
      <RootSlot>
        <ContainerSlot>{children}</ContainerSlot>
      </RootSlot>
    );
  };
}, buildUseTokens<ListboxTokens>({}));
Listbox.displayName = listboxName;

export { Listbox };
