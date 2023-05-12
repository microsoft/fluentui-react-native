import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { DrawerName } from './Drawer.types';
import type { DrawerTokens, DrawerSlotProps, DrawerProps } from './Drawer.types';
import { defaultDrawerTokens } from './DrawerTokens';

export const stylingSettings: UseStylingOptions<DrawerProps, DrawerSlotProps, DrawerTokens> = {
  tokens: [defaultDrawerTokens, DrawerName],
  slotProps: {
    modal: buildProps(
      (_tokens: DrawerTokens, _theme: Theme) => ({
        style: {
          elevation: 10,
        },
      }),
      [],
    ),
    backdrop: buildProps(
      (_tokens: DrawerTokens, _theme: Theme) => ({
        // empty for now, tokens will be added in next PR
      }),
      [],
    ),
    backdropContent: buildProps(
      (tokens: DrawerTokens, _theme: Theme) => ({
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
      (tokens: DrawerTokens, _theme: Theme) => ({
        style: {
          position: 'absolute',
          top: 0,
          backgroundColor: tokens.drawerBackgroundColor,
        },
      }),
      [],
    ),
    handle: buildProps(
      (tokens: DrawerTokens, _theme: Theme) => ({
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
