import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SpinnerTokens } from './Spinner.types.win32';

export const defaultSpinnerTokens: TokenSettings<SpinnerTokens, Theme> = (t: Theme) =>
  ({
    apprearance: 'primary',
    tailColor: t.colors.brandStroke1,
    trackColor: t.colors.brandStroke2,
    size: 'medium',
    inverted: {
      tailColor: t.colors.neutralStroke2,
      trackColor: t.colors.neutralBackgroundInverted,
    },
  } as SpinnerTokens);
