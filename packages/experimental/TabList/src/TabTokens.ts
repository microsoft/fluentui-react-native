import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabTokens } from '.';

export const tabStates: (keyof TabTokens)[] = ['hovered', 'selected', 'focused', 'disabled', 'pressed'];

export const defaultTabTokens: TokenSettings<TabTokens, Theme> = () => ({} as TabTokens);
