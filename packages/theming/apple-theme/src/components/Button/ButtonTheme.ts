
import type { Theme } from '@fluentui-react-native/framework';
import { immutableMerge } from '@fluentui-react-native/immutable-merge';

import { defaultButtonColorTokens } from './ButtonColorTokens';
import { defaultButtonFontTokens } from './ButtonFontTokens';
import { defaultButtonTokens } from './ButtonTokens';
import { defaultCompoundButtonColorTokens } from './CompoundButtonColorTokens';
import { defaultCompoundButtonFontTokens } from './CompoundButtonFontTokens';
import { defaultCompoundButtonTokens } from './CompoundButtonTokens';
import { defaultFABColorTokens } from './FABColorTokens';
import { defaultFABTokens } from './FABTokens';
import { defaultToggleButtonColorTokens } from './ToggleButtonColorTokens';

export const defaultButtonTheme = (theme: Theme) =>
({
  components: {
    Button: immutableMerge<object>(defaultButtonColorTokens(theme), defaultButtonFontTokens(theme), defaultButtonTokens(theme)),
    CompoundButton:
    immutableMerge<object>(
      defaultButtonTokens(theme),
      defaultButtonColorTokens(theme),
      defaultCompoundButtonColorTokens(theme),
      defaultCompoundButtonFontTokens(theme),
      defaultCompoundButtonTokens(theme)),

    FAB: immutableMerge<object>(defaultFABTokens(theme), defaultFABColorTokens(theme)),

    ToggleButton:
    immutableMerge<object>(
      defaultButtonTokens(theme),
      defaultButtonFontTokens(theme),
      defaultButtonColorTokens(theme),
      defaultToggleButtonColorTokens(theme)),
  }
});
