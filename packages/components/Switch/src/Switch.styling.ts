import { buttonName, SwitchTokens, SwitchSlotProps, ButtonProps } from './Switch.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, shadowStyles } from '@fluentui-react-native/tokens';
import { defaultSwitchTokens } from './SwitchTokens';

export const switchStates: (keyof SwitchTokens)[] = ['hovered', 'focused', 'pressed', 'disabled', 'toggleOn', 'toggleOff'];

export const stylingSettings: UseStylingOptions<ButtonProps, SwitchSlotProps, SwitchTokens> = {
  tokens: [defaultSwitchTokens, buttonName],
  states: switchStates,
  slotProps: {
    root: buildProps(
      () => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          height: 28,
          padding: 6,
        },
      }),
      [],
    ),
    track: buildProps(
      (tokens: SwitchTokens) => ({
        style: {
          flexDirection: 'row',
          height: 20,
          borderRadius: 50,
          minWidth: 40,
          backgroundColor: tokens.background,
          borderColor: tokens.stroke,
          borderWidth: 1,
          padding: 2,
          justifyContent: tokens.justifyContent,
        },
      }),
      ['backgroundColor', 'width', ...borderStyles.keys, ...layoutStyles.keys, ...shadowStyles.keys],
    ),
    thumb: buildProps(
      (tokens: SwitchTokens) => ({
        style: {
          backgroundColor: tokens.thumb,
          height: 14,
          width: 14,
          borderRadius: 17,
        },
      }),
      [],
    ),
    label: buildProps(() => ({
      style: {
        marginLeft: 10,
      },
    })),
  },
};
