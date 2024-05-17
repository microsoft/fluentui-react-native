
import type { Theme } from '@fluentui-react-native/framework';
import { immutableMerge } from '@fluentui-react-native/immutable-merge';

import { defaultButtonColorTokens } from './ButtonColorTokens';
import { defaultButtonFontTokens } from './ButtonFontTokens';
import { defaultButtonTokens } from './ButtonTokens';
import { defaultToggleButtonColorTokens } from './ToggleButtonColorTokens';

export const defaultButtonTheme = (theme: Theme) =>
({
  components: {
    Button: immutableMerge<object>(defaultButtonColorTokens(theme), defaultButtonFontTokens(theme), defaultButtonTokens(theme)),
    ToggleButton:
    immutableMerge<object>(
      defaultButtonTokens(theme),
      defaultButtonFontTokens(theme),
      defaultButtonColorTokens(theme),
      defaultToggleButtonColorTokens(theme)),
  }
});
