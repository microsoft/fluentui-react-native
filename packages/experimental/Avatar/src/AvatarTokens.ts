import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { AvatarTokens } from '.';
import { convertCoinColorFluent } from './Avatar.helpers';

export const AvatarStates: (keyof AvatarTokens)[] = [
  'avatarSize',
  'iconSize',
  'iconStrokeWidth',
  'iconStrokeColor',
  'initialsSize',
  'horizontalIconAlignment',
  'verticalIconAlignment',
  'backgroundColor',
];

export const defaultAvatarTokens: TokenSettings<AvatarTokens, Theme> = () =>
  ({
    horizontalIconAlignment: 'end',
    verticalIconAlignment: 'end',
    color: 'white', // initials is always 'white', unless overriden by token
    iconStrokeColor: 'white', // icon stroke color is always 'white', unless overriden by token
    backgroundColor: convertCoinColorFluent('cornflower'),
  } as AvatarTokens);
