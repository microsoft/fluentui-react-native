/** @jsxImportSource @fluentui-react-native/framework-base */
import React from 'react';
import { View } from 'react-native';

import type { ButtonProps } from '@fluentui-react-native/button';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import type { UseTokens } from '@fluentui-react-native/framework';
import { buildUseTokens, compressible, useSlot } from '@fluentui-react-native/framework';
import type { PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';
import type { SvgProps } from 'react-native-svg';
import { Path, Svg } from 'react-native-svg';

import type { DropdownProps, DropdownTokens } from './Dropdown.types';
import { dropdownName } from './Dropdown.types';
import type { ListboxProps } from '../Listbox';
import { Listbox } from '../Listbox';

const Dropdown = compressible<DropdownProps, DropdownTokens>((props: DropdownProps, _useTokens: UseTokens<DropdownTokens>) => {
  const [isOpen, setOpen] = React.useState(false);
  const onButtonClick = React.useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen, setOpen]);
  const defaultRef = React.useRef<View>(null);

  const buttonProps: ButtonProps = React.useMemo(
    () => ({
      componentRef: defaultRef,
      onClick: onButtonClick,
    }),
    [defaultRef, onButtonClick],
  );

  const expandIconProps: SvgProps = React.useMemo(
    () => ({
      width: '16',
      height: '16',
      viewBox: '0 0 16 16',
      fill: 'none',
    }),
    [],
  );
  const expandIconPath = (
    <Path d="M3.14645 5.64645C3.34171 5.45118 3.65829 5.45118 3.85355 5.64645L8 9.79289L12.1464 5.64645C12.3417 5.45118 12.6583 5.45118 12.8536 5.64645C13.0488 5.84171 13.0488 6.15829 12.8536 6.35355L8.35355 10.8536C8.15829 11.0488 7.84171 11.0488 7.64645 10.8536L3.14645 6.35355C2.95118 6.15829 2.95118 5.84171 3.14645 5.64645Z" />
  );

  const listboxProps = React.useMemo(
    () => ({
      target: defaultRef,
    }),
    [defaultRef],
  );

  type PressableView = React.FunctionComponent<PressablePropsExtended>;
  const RootSlot = useSlot<PressablePropsExtended>(View as unknown as PressableView, props);
  const ButtonSlot = useSlot<ButtonProps>(Button, buttonProps);
  const ExpandIconSlot = useSlot<SvgProps>(Svg, expandIconProps);
  const ListboxSlot = useSlot<ListboxProps>(Listbox, listboxProps);

  return (_final: DropdownProps, ...children: React.ReactNode[]) => {
    return (
      <RootSlot>
        <ButtonSlot>
          Test
          <ExpandIconSlot>{expandIconPath}</ExpandIconSlot>
        </ButtonSlot>
        {isOpen && <ListboxSlot>{children}</ListboxSlot>}
      </RootSlot>
    );
  };
}, buildUseTokens<DropdownTokens>({}));
Dropdown.displayName = dropdownName;

export { Dropdown };
