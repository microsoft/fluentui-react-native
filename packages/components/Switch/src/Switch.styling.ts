import { Platform } from 'react-native';

import type { UseStylingOptions, Theme } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles } from '@fluentui-react-native/tokens';

import { switchName } from './Switch.types';
import type { SwitchTokens, SwitchSlotProps, SwitchProps } from './Switch.types';
import { defaultSwitchTokens } from './SwitchTokens';

export const switchStates: (keyof SwitchTokens)[] = [
  'toggleOn',
  'toggleOff',
  'before',
  'after',
  'above',
  'beforeContent',
  'afterContent',
  'hovered',
  'focused',
  'pressed',
  'disabled',
];

const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';

export const stylingSettings: UseStylingOptions<SwitchProps, SwitchSlotProps, SwitchTokens> = {
  tokens: [defaultSwitchTokens, switchName],
  states: switchStates,
  slotProps: {
    root: buildProps(
      (tokens: SwitchTokens, theme: Theme) => ({
        style: {
          alignItems: 'center',
          flexDirection: tokens.flexDirection,
          alignSelf: 'flex-start',
          borderColor: tokens.focusStrokeColor,
          borderWidth: tokens.focusBorderWidth,
          borderRadius: tokens.focusBorderRadius,
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['flexDirection', 'focusStrokeColor', 'focusBorderWidth', 'focusBorderRadius', ...layoutStyles.keys],
    ),
    toggleContainer: buildProps(
      (tokens: SwitchTokens) => ({
        style: {
          flexDirection: tokens.toggleContainerFlexDirection,
          alignItems: 'center',
        },
      }),
      ['toggleContainerFlexDirection'],
    ),
    track: buildProps(
      (tokens: SwitchTokens, theme: Theme) => ({
        style: {
          height: tokens.trackHeight,
          width: tokens.trackWidth,
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor: tokens.trackColor,
          marginTop: tokens.trackMarginTop,
          marginBottom: tokens.trackMarginBottom,
          marginLeft: tokens.trackMarginLeft,
          marginRight: tokens.trackMarginRight,
          justifyContent: tokens.justifyContent,
          ...borderStyles.from(tokens, theme),
        },
      }),
      [
        'trackColor',
        'trackMarginTop',
        'trackMarginBottom',
        'trackMarginLeft',
        'trackMarginRight',
        'trackHeight',
        'trackWidth',
        'justifyContent',
        ...borderStyles.keys,
      ],
    ),
    thumb: buildProps(
      (tokens: SwitchTokens) => ({
        style: {
          backgroundColor: tokens.thumbColor,
          height: tokens.thumbSize,
          width: tokens.thumbSize,
          borderRadius: tokens.thumbRadius,
          margin: tokens.thumbMargin,
          ...(Platform.OS === 'android' && { elevation: tokens.elevation }),
        },
      }),
      ['thumbColor', 'thumbSize', 'thumbRadius', 'thumbMargin'],
    ),
    label: buildProps(
      (tokens: SwitchTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...(isMobile && { flexShrink: 1 }),
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    onOffTextContainer: buildProps(
      () => ({
        style: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
        },
      }),
      [],
    ),
    onOffText: buildProps(
      (tokens: SwitchTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
  },
};
