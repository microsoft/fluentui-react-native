/** @jsx withSlots */
import { IViewProps } from '@fluentui-react-native/adapters';
import { ButtonV1 as Button, ButtonProps } from '@fluentui-react-native/button';
import { buildUseTokens, compressible, useSlot, UseTokens, withSlots } from '@fluentui-react-native/framework';
import React from 'react';
import { View } from 'react-native';
import { Path, Svg, SvgProps } from 'react-native-svg';
import { DropdownProps, DropdownTokens } from './Dropdown.types';

export const Dropdown = compressible<DropdownProps, DropdownTokens>((props: DropdownProps, _useTokens: UseTokens<DropdownTokens>) => {
  const onButtonClick = React.useCallback(() => {}, []); //eslint-disable-line
  const buttonProps: ButtonProps = React.useMemo(
    () => ({
      onClick: onButtonClick,
    }),
    [onButtonClick],
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

  const RootSlot = useSlot<IViewProps>(View, props);
  const ButtonSlot = useSlot<ButtonProps>(Button, buttonProps);
  const ExpandIconSlot = useSlot<SvgProps>(Svg, expandIconProps);

  return (_final: DropdownProps, ..._children: React.ReactNode[]) => {
    return (
      <RootSlot>
        <ButtonSlot>
          Test
          <ExpandIconSlot>{expandIconPath}</ExpandIconSlot>
        </ButtonSlot>
      </RootSlot>
    );
  };
}, buildUseTokens<DropdownTokens>({}));
