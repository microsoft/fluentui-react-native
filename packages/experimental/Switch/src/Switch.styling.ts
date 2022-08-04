import { switchName, SwitchTokens, SwitchSlotProps, SwitchProps } from './Switch.types';
import { UseStylingOptions, Theme, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultSwitchTokens } from './SwitchTokens';

export const switchStates: (keyof SwitchTokens)[] = [
  'toggleOn',
  'toggleOff',
  'before',
  'after',
  'above',
  'hovered',
  'focused',
  'pressed',
  'disabled',
];

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
          minHeight: tokens.minHeight,
          minWidth: tokens.minWidth,
          borderColor: tokens.focusStrokeColor,
          borderWidth: tokens.focusBorderWidth,
          borderRadius: tokens.focusBorderRadius,
          ...layoutStyles.from(tokens, theme),
        },
      }),
      [
        'flexDirection',
        'minHeight',
        'minWidth',
        'minWidth',
        'focusStrokeColor',
        'focusBorderWidth',
        'focusBorderRadius',
        ...layoutStyles.keys,
      ],
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
          marginTop: 2,
          marginBottom: 2,
          marginLeft: 4,
          marginRight: 4,
          justifyContent: tokens.justifyContent,
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['trackColor', 'trackHeight', 'trackWidth', 'justifyContent', ...borderStyles.keys],
    ),
    thumb: buildProps(
      (tokens: SwitchTokens) => ({
        style: {
          backgroundColor: tokens.thumbColor,
          height: tokens.thumbSize,
          width: tokens.thumbSize,
          borderRadius: tokens.thumbRadius,
          margin: 2,
        },
      }),
      ['thumbColor'],
    ),
    label: buildProps(
      (tokens: SwitchTokens) => ({
        style: {
          color: tokens.color,
        },
      }),
      ['color'],
    ),
    onOffText: buildProps(
      (tokens: SwitchTokens) => ({
        style: {
          color: tokens.color,
        },
      }),
      ['color'],
    ),
  },
};
