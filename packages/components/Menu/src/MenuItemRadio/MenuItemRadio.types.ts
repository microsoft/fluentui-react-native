import type * as React from 'react';
import type { ImageProps } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import type { PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';

import type { MenuItemProps } from '../MenuItem/MenuItem.types';
import type { MenuItemCheckboxTokens } from '../MenuItemCheckbox';

export const menuItemRadioName = 'MenuItemRadio';

export interface MenuItemRadioProps extends MenuItemProps {
  /**
   * Identifier for the control
   */
  name: string;
}

export interface MenuItemRadioInfo {
  props: MenuItemRadioProps & React.ComponentPropsWithRef<any>;
  state: PressableState & { hasIcons: boolean; hasTooltips: boolean };
}

export interface MenuItemRadioSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  content?: TextProps;
  radioButton?: PressablePropsExtended;
  radioInnerCircle?: React.PropsWithRef<IViewProps>;
  iconPlaceholder?: React.PropsWithRef<IViewProps>;
  imgIcon?: ImageProps;
  fontOrSvgIcon?: IconProps;
}

export interface MenuItemRadioType {
  props: MenuItemRadioProps;
  tokens: MenuItemCheckboxTokens;
  slotProps: MenuItemRadioSlotProps;
}
