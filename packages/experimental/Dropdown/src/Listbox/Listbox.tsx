/** @jsx withSlots */
import { IViewProps } from '@fluentui-react-native/adapters';
import { Callout, ICalloutProps } from '@fluentui-react-native/callout';
import { buildUseTokens, compressible, useSlot, UseTokens, withSlots } from '@fluentui-react-native/framework';
import React from 'react';
import { View } from 'react-native';
import { listboxName, ListboxProps, ListboxTokens } from './Listbox.types';

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
