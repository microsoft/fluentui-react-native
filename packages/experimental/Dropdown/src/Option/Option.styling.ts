import { UseStylingOptions } from '@fluentui-react-native/framework';
import { optionName, OptionProps, OptionSlotProps, OptionTokens } from './Option.types';

export const stylingSettings: UseStylingOptions<OptionProps, OptionSlotProps, OptionTokens> = {
  tokens: [optionName],
  slotProps: {
    root: {
      style: {
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderColor: 'black',
        borderRadius: 2,
        borderWidth: 1,
        display: 'flex',
        flexDirection: 'row',
        minHeight: 24,
        minWidth: 160,
      },
    },
    checkIcon: {
      height: 12,
      width: 12,
      viewBox: '0 0 12 12',
    },
    label: {
      color: 'black',
    },
  },
};
