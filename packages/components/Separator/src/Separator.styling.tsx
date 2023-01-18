import { separatorName, SeparatorProps, SeparatorPropTokens, SeparatorTokens, SeperatorSlotProps } from './Separator.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultSeparatorTokens } from './SeparatorTokens';
import { Platform } from 'react-native';

const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';
const tokensThatAreAlsoProps: (keyof SeparatorPropTokens)[] = ['vertical', 'insetSpacing'];
export const stylingSettings: UseStylingOptions<SeparatorProps, SeperatorSlotProps, SeparatorTokens> = {
  tokens: [defaultSeparatorTokens, separatorName],
  tokensThatAreAlsoProps,
  slotProps: {
    root: buildProps(
      (tokens: SeparatorTokens) => {
        return {
          style: {
            ...(tokens.vertical ? { borderLeftWidth: tokens.separatorWidth } : { borderTopWidth: tokens.separatorWidth }),
            ...(tokens.color && { borderColor: tokens.color }),
            ...(isMobile && { marginStart: tokens.insetSpacing }),
          },
        };
      },
      ['color', 'vertical', 'separatorWidth', 'insetSpacing'],
    ),
  },
};
