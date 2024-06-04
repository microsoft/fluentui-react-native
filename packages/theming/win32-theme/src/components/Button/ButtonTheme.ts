import { immutableMerge } from '@fluentui-react-native/immutable-merge';
import type { Theme } from '@fluentui-react-native/theme-types';

import { defaultButtonColorTokens } from './ButtonColorTokens';
import { defaultButtonFontTokens } from './ButtonFontTokens';
import { defaultButtonTokens } from './ButtonTokens';
import { defaultCompoundButtonColorTokens } from './CompoundButtonColorTokens';
import { defaultCompoundButtonFontTokens } from './CompoundButtonFontTokens';
import { defaultCompoundButtonTokens } from './CompoundButtonTokens';
import { defaultToggleButtonColorTokens } from './ToggleButtonColorTokens';

export const defaultButtonTheme = (theme: Theme) => ({
  components: {
    Button: immutableMerge<object>(defaultButtonColorTokens(theme), defaultButtonFontTokens(theme), defaultButtonTokens(theme)),
    CompoundButton: immutableMerge<object>(
      defaultButtonTokens(theme),
      defaultButtonColorTokens(theme),
      defaultCompoundButtonColorTokens(theme),
      defaultCompoundButtonFontTokens(theme),
      defaultCompoundButtonTokens(theme),
    ),
    ToggleButton: immutableMerge<object>(
      defaultButtonTokens(theme),
      defaultButtonFontTokens(theme),
      defaultButtonColorTokens(theme),
      defaultToggleButtonColorTokens(theme),
    ),
  },
});
