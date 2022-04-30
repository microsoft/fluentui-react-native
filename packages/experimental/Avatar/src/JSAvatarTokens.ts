import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { JSAvatarTokens } from '.';
import { convertCoinColorFluent } from './JSAvatar.helpers';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const defaultJSAvatarTokens: TokenSettings<JSAvatarTokens, Theme> = () =>
  ({
    horizontalIconAlignment: 'end',
    verticalIconAlignment: 'end',
    color: 'white', // initials is always 'white', unless overriden by token
    iconStrokeColor: 'white', // icon stroke color is always 'white', unless overriden by token
    backgroundColor: convertCoinColorFluent('cornflower'),
    avatarOpacity: 1,
    circular: {
      borderRadius: globalTokens.corner.radius.circle,
    },
    square: {
      borderRadius: globalTokens.corner.radius.medium,
    },
    inactive: {
      avatarOpacity: 0.8,
    },
    size20: {
      width: 20,
      height: 20,
      badgeSize: 'smallest',
      iconSize: 10,
      initialsSize: 16,
    },
    size24: {
      width: 24,
      height: 24,
      badgeSize: 'smallest',
      iconSize: 10,
      initialsSize: 16,
    },
    size28: {
      width: 28,
      height: 28,
      badgeSize: 'smaller',
      iconSize: 16,
      initialsSize: 20,
    },
    size32: {
      width: 32,
      height: 32,
      badgeSize: 'smaller',
      iconSize: 16,
      initialsSize: 20,
    },
    size36: {
      width: 36,
      height: 36,
      badgeSize: 'smaller',
      iconSize: 16,
      initialsSize: 20,
    },
    size40: {
      width: 40,
      height: 40,
      badgeSize: 'small',
      iconSize: 16,
      initialsSize: 20,
    },
    size48: {
      width: 48,
      height: 48,
      badgeSize: 'small',
      iconSize: 20,
      initialsSize: 24,
    },
    size56: {
      width: 56,
      height: 56,
      badgeSize: 'medium',
      iconSize: 24,
      initialsSize: 28,
    },
    size64: {
      width: 64,
      height: 64,
      badgeSize: 'large',
      iconSize: 28,
      initialsSize: 32,
    },
    size72: {
      width: 72,
      height: 72,
      badgeSize: 'large',
      iconSize: 28,
      initialsSize: 32,
    },
    size96: {
      width: 96,
      height: 96,
      badgeSize: 'largest',
      iconSize: 40,
      initialsSize: 48,
    },
    size120: {
      width: 120,
      height: 120,
      badgeSize: 'largest',
      iconSize: 40,
      initialsSize: 48,
    },
  } as JSAvatarTokens);
