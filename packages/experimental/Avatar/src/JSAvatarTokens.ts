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
    circular: {
      borderRadius: globalTokens.corner.radius.circle,
    },
    square: {
      borderRadius: globalTokens.corner.radius.medium,
    },
  } as JSAvatarTokens);
