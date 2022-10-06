import { IViewProps } from '@fluentui-react-native/adapters';
import { ButtonV1 as Button, ButtonProps } from '@fluentui-react-native/button';
import { buildUseTokens, compressible, useSlot, UseTokens } from '@fluentui-react-native/framework';
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
      width: '20',
      height: '20',
      viewBox: '0 0 20 20',
      fill: 'none',
    }),
    [],
  );

  const RootSlot = useSlot<IViewProps>(View, props);
  const ButtonSlot = useSlot<ButtonProps>(Button, buttonProps);
  const ExpandIconSlot = useSlot<SvgProps>(Svg, expandIconProps);

  return (_final: DropdownProps, ..._children: React.ReactNode[]) => {
    return (
      <RootSlot>
        <ButtonSlot>
          {'Test'}
          <ExpandIconSlot>
            <Path d="M15.8537 7.64582C16.0493 7.84073 16.0499 8.15731 15.855 8.35292L10.39 13.8374C10.1751 14.0531 9.82574 14.0531 9.6108 13.8374L4.14582 8.35292C3.9509 8.15731 3.95147 7.84073 4.14708 7.64582C4.34269 7.4509 4.65927 7.45147 4.85418 7.64708L10.0004 12.8117L15.1466 7.64708C15.3415 7.45147 15.6581 7.4509 15.8537 7.64582Z" />
          </ExpandIconSlot>
        </ButtonSlot>
      </RootSlot>
    );
  };
}, buildUseTokens<DropdownTokens>({}));
