/** @jsx withSlots */
import { IViewProps } from '@fluentui-react-native/adapters';
import { ButtonV1 as Button, ButtonProps } from '@fluentui-react-native/button';
import {
  applyTokenLayers,
  buildUseTokens,
  compressible,
  Theme,
  useFluentTheme,
  useSlot,
  UseTokens,
  withSlots,
} from '@fluentui-react-native/framework';
import { useAsPressable } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import { View } from 'react-native';
import { Path, Svg, SvgProps } from 'react-native-svg';
import { dropdownName, DropdownProps, DropdownTokens } from './Dropdown.types';

// Change later for win32
const dropdownTokens = buildUseTokens<DropdownTokens>((t: Theme) => ({
  buttonBorder: t.colors.neutralStroke1,
  expandIconColor: 'red',
  hovered: {
    buttonBorder: t.colors.neutralStroke1Hover,
    expandIconColor: 'pink',
  },
  pressed: {
    buttonBorder: t.colors.neutralStrokeAccessible,
    expandIconColor: 'blue',
  },
}));

const dropdownState: (keyof DropdownTokens)[] = ['hovered', 'focused', 'pressed'];

const Dropdown = compressible<DropdownProps, DropdownTokens>((props: DropdownProps, useTokens: UseTokens<DropdownTokens>) => {
  const pressableState = useAsPressable(props);
  const theme = useFluentTheme();
  const [tokens, tokenCache] = useTokens(theme);
  const [mergedTokens] = applyTokenLayers(tokens, dropdownState, tokenCache, (layer) => pressableState.state[layer]);

  const onButtonClick = React.useCallback(() => {}, []); //eslint-disable-line
  const buttonProps: ButtonProps = React.useMemo(
    () => ({
      ...pressableState.props,
      onClick: onButtonClick,
    }),
    [onButtonClick, pressableState],
  );
  const CustButton = React.useMemo(
    () =>
      Button.customize({
        borderColor: tokens.buttonBorder,
        hovered: {
          borderColor: tokens.hovered.buttonBorder,
        },
        pressed: {
          borderColor: tokens.pressed.buttonBorder,
        },
      }),
    [tokens],
  );

  const expandIconProps: SvgProps = React.useMemo(
    () => ({
      color: mergedTokens.expandIconColor,
      width: '16',
      height: '16',
      viewBox: '0 0 16 16',
      fill: 'none',
    }),
    [mergedTokens],
  );
  const expandIconPath = (
    <Path
      fill="currentColor"
      d="M3.14645 5.64645C3.34171 5.45118 3.65829 5.45118 3.85355 5.64645L8 9.79289L12.1464 5.64645C12.3417 5.45118 12.6583 5.45118 12.8536 5.64645C13.0488 5.84171 13.0488 6.15829 12.8536 6.35355L8.35355 10.8536C8.15829 11.0488 7.84171 11.0488 7.64645 10.8536L3.14645 6.35355C2.95118 6.15829 2.95118 5.84171 3.14645 5.64645Z"
    />
  );

  const RootSlot = useSlot<IViewProps>(View, props);
  const ButtonSlot = useSlot<ButtonProps>(CustButton, buttonProps);
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
}, dropdownTokens);
Dropdown.displayName = dropdownName;

export { Dropdown };
