import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ComponentNameTokens } from './ComponentName.types';

export const defaultComponentNameTokens: TokenSettings<ComponentNameTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.ghostBackground,
    color: t.colors.brandBackground,
    borderColor: t.colors.brandBackground,
    small: {
      borderWidth: 1,
      fontSize: t.typography.sizes.body,
    },
    medium: {
      borderWidth: 2,
      fontSize: t.typography.sizes.secondary,
    },
    large: {
      borderWidth: 4,
      fontSize: t.typography.sizes.header,
    },
  } as ComponentNameTokens);
