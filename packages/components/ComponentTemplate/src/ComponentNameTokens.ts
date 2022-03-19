import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ComponentNameTokens } from './ComponentName.types';

export const defaultComponentNameTokens: TokenSettings<ComponentNameTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.brandBackground,
    color: t.colors.neutralForegroundInverted,
    small: {},
    medium: {},
    large: {},
  } as ComponentNameTokens);
