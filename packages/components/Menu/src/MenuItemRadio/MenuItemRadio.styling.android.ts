import { Platform } from 'react-native';

import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';

import type { MenuItemRadioProps, MenuItemRadioSlotProps } from './MenuItemRadio.types';
import { menuItemRadioName } from './MenuItemRadio.types';
import { defaultMenuItemRadioTokens } from './MenuItemRadioTokens';
import type { MenuItemRadioTokens } from '../MenuItemRadio/MenuItemRadio.types';

export const menuItemRadioStates: (keyof MenuItemRadioTokens)[] = ['hovered', 'focused', 'pressed', 'disabled', 'checked'];

export const stylingSettings: UseStylingOptions<MenuItemRadioProps, MenuItemRadioSlotProps, MenuItemRadioTokens> = {
  tokens: [defaultMenuItemRadioTokens, menuItemRadioName],
  states: menuItemRadioStates,
  slotProps: {
    root: buildProps(
      (tokens: MenuItemRadioTokens, theme: Theme) => ({
        style: {
          alignItems: 'center',
          backgroundColor: tokens.backgroundColor,
          display: 'flex',
          flexDirection: 'row',
          ...layoutStyles.from(tokens, theme),
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),

    radioButton: buildProps(
      (tokens: MenuItemRadioTokens) => ({
        style: {
          backgroundColor: 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginEnd: tokens.paddingHorizontal,
          width: tokens.radioOuterCircleSize,
          height: tokens.radioOuterCircleSize,
          borderWidth: tokens.radioBorderWidth,
          borderStyle: tokens.radioBorderStyle,
          borderRadius: tokens.radioOuterCircleSize / 2,
          borderColor: tokens.radioBorder,
        },
        android_ripple: { color: tokens.rippleColor, radius: tokens.rippleRadius, borderless: true },
      }),
      ['radioBorderWidth', 'radioBorderStyle', 'radioOuterCircleSize', 'rippleColor', 'rippleRadius', 'radioBorder'],
    ),

    radioInnerCircle: buildProps(
      (tokens: MenuItemRadioTokens) => ({
        style: {
          opacity: tokens.radioVisibility,
          borderRadius: tokens.radioInnerCircleSize / 2,
          height: tokens.radioInnerCircleSize,
          width: tokens.radioInnerCircleSize,
          backgroundColor: tokens.radioFill,
        },
      }),
      ['radioInnerCircleSize', 'radioVisibility', 'radioFill'],
    ),

    content: buildProps(
      (tokens: MenuItemRadioTokens, theme: Theme) => ({
        style: {
          flexGrow: 1,
          color: tokens.color,
          ...(Platform.OS === 'android' && { flexShrink: 1 }),
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    iconPlaceholder: buildProps(
      (tokens: MenuItemRadioTokens) => ({
        style: {
          minHeight: tokens.iconSize,
          minWidth: tokens.iconSize,
          alignItems: 'center',
          justifyContent: 'center',
          marginEnd: tokens.gap,
        },
      }),
      ['checkmarkSize', 'gap'],
    ),
    imgIcon: buildProps(
      (tokens: MenuItemRadioTokens) => ({
        style: { tintColor: tokens.iconColor, height: tokens.iconSize, width: tokens.iconSize },
      }),
      ['gap', 'iconColor', 'iconSize'],
    ),
    fontOrSvgIcon: buildProps(
      (tokens: MenuItemRadioTokens) => ({ color: tokens.iconColor, size: tokens.iconSize }),
      ['gap', 'iconColor', 'iconSize'],
    ),
  },
};
