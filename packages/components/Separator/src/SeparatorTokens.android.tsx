import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { SeparatorTokens } from './Separator.types';

export const defaultSeparatorTokens: TokenSettings<SeparatorTokens, Theme> = () =>
  ({
    separatorWidth: 1,
  } as SeparatorTokens);
