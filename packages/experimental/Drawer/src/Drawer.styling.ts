import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { DrawerName } from './Drawer.types';
import type { DrawerTokens, DrawerSlotProps, DrawerProps } from './Drawer.types';
import { defaultDrawerTokens } from './DrawerTokens';

export const stylingSettings: UseStylingOptions<DrawerProps, DrawerSlotProps, DrawerTokens> = {
  tokens: [defaultDrawerTokens, DrawerName],
  tokensThatAreAlsoProps: 'all',
  states: ['left', 'right', 'bottom'],
  slotProps: {
    scrimContent: buildProps(
      (tokens: DrawerTokens, _theme: Theme) => ({
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: tokens.scrimColor,
          opacity: tokens.scrimOpacity,
        },
      }),
      ['scrimColor'],
    ),
    content: buildProps(
      (tokens: DrawerTokens, _theme: Theme) => ({
        style: {
          position: 'absolute',
          height: tokens.height,
          width: tokens.width,
          elevation: tokens.drawerElevation,
          borderTopEndRadius: tokens.drawerCornerRadius,
          borderTopStartRadius: tokens.drawerCornerRadius,
          right: tokens.rightPosition,
          left: tokens.leftPosition,
          bottom: tokens.bottomPosition,
          top: tokens.topPosition,
          backgroundColor: tokens.drawerBackgroundColor,
        },
      }),
      ['drawerBackgroundColor', 'drawerElevation', 'height', 'width'],
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
      ['handleWidth', 'handleHeight', 'handleCornerRadius', 'handleBackgroundColor', 'handleAlignment', 'handleMarginTop'],
    ),
  },
};
