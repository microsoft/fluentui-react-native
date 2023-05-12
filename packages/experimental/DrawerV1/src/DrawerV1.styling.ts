import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { DrawerV1Name } from './DrawerV1.types';
import type { DrawerV1Tokens, DrawerV1SlotProps, DrawerV1Props } from './DrawerV1.types';
import { defaultDrawerV1Tokens } from './DrawerV1Tokens';

export const stylingSettings: UseStylingOptions<DrawerV1Props, DrawerV1SlotProps, DrawerV1Tokens> = {
  tokens: [defaultDrawerV1Tokens, DrawerV1Name],
  slotProps: {
    modal: buildProps(
      (_tokens: DrawerV1Tokens, _theme: Theme) => ({
        style: {
          elevation: 10,
        },
      }),
      [],
    ),
    backdrop: buildProps(
      (_tokens: DrawerV1Tokens, _theme: Theme) => ({
        // empty for now, tokens will be added in next PR
      }),
      [],
    ),
    backdropContent: buildProps(
      (tokens: DrawerV1Tokens, _theme: Theme) => ({
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: tokens.backdropColor,
        },
      }),
      [],
    ),
    content: buildProps(
      (tokens: DrawerV1Tokens, _theme: Theme) => ({
        style: {
          position: 'absolute',
          top: 0,
          backgroundColor: tokens.drawerBackgroundColor,
        },
      }),
      [],
    ),
    handle: buildProps(
      (tokens: DrawerV1Tokens, _theme: Theme) => ({
        style: {
          width: tokens.handleWidth,
          height: tokens.handleHeight,
          borderRadius: tokens.handleCornerRadius,
          backgroundColor: tokens.handleBackgroundColor,
          alignSelf: tokens.handleAlignment,
          marginTop: tokens.handleMarginTop,
        },
      }),
      [],
    ),
  },
};
