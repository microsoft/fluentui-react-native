import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { SeparatorTokens } from './Separator.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const defaultSeparatorTokens: TokenSettings<SeparatorTokens, Theme> = () =>
  ({
    separatorWidth: globalTokens.stroke.width10,
  } as SeparatorTokens);
