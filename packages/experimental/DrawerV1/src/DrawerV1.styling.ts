import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';

import { DrawerV1Name } from './DrawerV1.types';
import type { DrawerV1Tokens, DrawerV1SlotProps, DrawerV1Props } from './DrawerV1.types';
import { defaultDrawerV1Tokens } from './DrawerV1Tokens';

export const DrawerV1States: (keyof DrawerV1Tokens)[] = ['hasIcon'];

export const stylingSettings: UseStylingOptions<DrawerV1Props, DrawerV1SlotProps, DrawerV1Tokens> = {
  tokens: [defaultDrawerV1Tokens, DrawerV1Name],
  states: DrawerV1States,
  slotProps: {
    root: buildProps(
      (tokens: DrawerV1Tokens, theme: Theme) => ({
        scrollEnabled: false,
        contentContainerStyle: {
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          backgroundColor: tokens.backgroundColor,
          paddingHorizontal: tokens.paddingHorizontal,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'paddingHorizontal', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    modal: buildProps((_tokens: DrawerV1Tokens, _theme: Theme) => ({}), []),
    backdrop: buildProps(
      (_tokens: DrawerV1Tokens, _theme: Theme) => ({
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 999,
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
        },
      }),
      [],
    ),
    backdropContent: buildProps((_tokens: DrawerV1Tokens, _theme: Theme) => ({}), []),
    content: buildProps(
      (_tokens: DrawerV1Tokens, _theme: Theme) => ({
        style: {
          position: 'absolute',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#FFF',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
      }),
      [],
    ),
    dragger: buildProps(
      (_tokens: DrawerV1Tokens, _theme: Theme) => ({
        style: {
          width: 40,
          height: 5,
          borderRadius: 10,
          backgroundColor: '#CCC',
          alignSelf: 'center',
          marginVertical: 10,
        },
      }),
      [],
    ),
  },
};
