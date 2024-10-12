import { immutableMerge } from '@fluentui-react-native/immutable-merge';
import type { Theme } from '@fluentui-react-native/theme-types';

import { defaultButtonColorTokens } from './ButtonColorTokens';
import { defaultButtonFontTokens } from './ButtonFontTokens';
import { defaultButtonTokens } from './ButtonTokens';
import { defaultFABColorTokens } from './FABColorTokens';
import { defaultFABTokens } from './FABTokens';
import { defaultToggleButtonColorTokens } from './ToggleButtonColorTokens';

export const defaultButtonTheme = (theme: Theme) => ({
  components: {
    Button: immutableMerge<object>(defaultButtonColorTokens(theme), defaultButtonFontTokens(theme), defaultButtonTokens(theme)),
    FAB: immutableMerge<object>(defaultFABTokens(theme), defaultFABColorTokens(theme)),
    ToggleButton: immutableMerge<object>(
      defaultButtonTokens(theme),
      defaultButtonFontTokens(theme),
      defaultButtonColorTokens(theme),
      defaultToggleButtonColorTokens(theme),
    ),
  },
});
