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
          minHeight: 28,
          minWidth: 40,
          padding: 6,
        },
      }),
      ['flexDirection'],
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
          height: 20,
          width: 40,
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
          height: 14,
          width: 14,
          borderRadius: 17,
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
