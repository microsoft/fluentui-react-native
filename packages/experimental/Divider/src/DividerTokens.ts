import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { DividerTokens } from './Divider.types';

export const defaultDividerTokens: TokenSettings<DividerTokens, Theme> = (theme: Theme) =>
  ({
    // base tokens
    alignment: 'center',
    contentPadding: 0,
    flexAfter: 1,
    flexBefore: 1,
    insetSize: 0,
    minWidth: 0,
    minHeight: 0,
    thickness: 1,
    // for aligning the divider if alignContent !== 'center'
    alignStart: {
      alignment: 'flex-start',
      flexBefore: 0,
    },
    alignEnd: {
      alignment: 'flex-end',
      flexAfter: 0,
    },
    // vertical style overrides
    isVertical: {
      minHeight: 24,
    },
    hasChildren: {
      contentPadding: 8,
      isVertical: {
        minHeight: 84,
      },
    },
    // appearances
    default: {
      lineColor: theme.colors.neutralStroke2,
      contentColor: theme.colors.neutralForeground2,
    },
    subtle: {
      lineColor: theme.colors.neutralStroke3,
      contentColor: theme.colors.neutralForeground3,
    },
    brand: {
      lineColor: theme.colors.brandStroke1,
      contentColor: theme.colors.brandForeground1,
    },
    strong: {
      lineColor: theme.colors.neutralStroke1,
      contentColor: theme.colors.neutralForeground1,
    },
  } as DividerTokens);
