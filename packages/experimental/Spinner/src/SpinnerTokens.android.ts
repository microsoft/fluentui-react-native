import { Appearance } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import { colorGrey56, colorGrey72 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SpinnerTokens } from './Spinner.types';
export const defaultSpinnerTokens: TokenSettings<SpinnerTokens, Theme> = () =>
  ({
    trackColor: Appearance.getColorScheme() === 'light' ? colorGrey56 : colorGrey72,
  }) as SpinnerTokens;
