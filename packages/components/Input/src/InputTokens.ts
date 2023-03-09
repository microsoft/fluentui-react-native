import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { InputTokens } from './Input.types';

export const defaultInputTokens: TokenSettings<InputTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.ghostBackground,
    color: t.colors.brandBackground,
    borderColor: t.colors.brandBackground,
    iconColor: 'black',
    iconSize: 24,
    dismissIconColor: 'black',
    dismissIconSize: 24,
  } as InputTokens);
