import { SeparatorName, SeparatorProps, SeparatorPropTokens, SeparatorTokens, SeperatorSlotProps } from './Separator.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultSeparatorTokens } from './SeparatorTokens';

const tokensThatAreAlsoProps: (keyof SeparatorPropTokens)[] = ['vertical'];

export const stylingSettings: UseStylingOptions<SeparatorProps, SeperatorSlotProps, SeparatorTokens> = {
  tokens: [defaultSeparatorTokens, SeparatorName],
  tokensThatAreAlsoProps,
  slotProps: {
    root: buildProps(
      (tokens: SeparatorTokens) => {
        return {
          style: {
            ...(tokens.vertical ? { borderLeftWidth: tokens.separatorWidth } : { borderTopWidth: tokens.separatorWidth }),
            ...(tokens.color && { borderColor: tokens.color }),
          },
        };
      },
      ['color', 'vertical', 'separatorWidth'],
    ),
  },
};
