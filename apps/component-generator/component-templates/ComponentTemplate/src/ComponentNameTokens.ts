import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ComponentNameTokens } from './ComponentName.types';

export const defaultComponentNameTokens: TokenSettings<ComponentNameTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.brandBackground,
    color: t.colors.neutralForegroundInverted,
    small: {
      fontSize: t.typography.sizes.body,
    },
    medium: {
      fontSize: t.typography.sizes.secondary,
    },
    large: {
      fontSize: t.typography.sizes.header,
    },
  } as ComponentNameTokens);
