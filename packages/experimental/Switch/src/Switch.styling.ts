import { switchName, SwitchTokens, SwitchSlotProps, SwitchProps } from './Switch.types';
import { UseStylingOptions, Theme, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, shadowStyles } from '@fluentui-react-native/tokens';
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
      (tokens: SwitchTokens) => ({
        style: {
          alignItems: 'center',
          flexDirection: tokens.flexDirection,
          alignSelf: 'flex-start',
          minHeight: tokens.minHeight,
          minWidth: tokens.minWidth,
          padding: tokens.padding,
        },
      }),
      ['flexDirection', 'minHeight', 'minWidth', 'padding'],
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
          flexDirection: 'row',
          height: tokens.trackHeight,
          width: tokens.trackWidth,
          backgroundColor: tokens.backgroundColor,
          padding: 2,
          marginTop: 2,
          marginBottom: 2,
          marginLeft: 4,
          marginRight: 4,
          justifyContent: tokens.justifyContent,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
          ...shadowStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'justifyContent', ...borderStyles.keys],
    ),
    thumb: buildProps(
      (tokens: SwitchTokens) => ({
        style: {
          backgroundColor: tokens.thumbColor,
          height: tokens.thumbSize,
          width: tokens.thumbSize,
          borderRadius: tokens.thumbRadius,
        },
      }),
      ['thumbColor'],
    ),
    label: buildProps(() => ({
      style: {
        color: 'black',
      },
    })),
    onOffText: buildProps(() => ({
      style: {},
    })),
  },
};
