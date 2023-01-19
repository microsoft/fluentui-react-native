import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { DividerTokens } from './Divider.types';

export const defaultDividerTokens: TokenSettings<DividerTokens, Theme> = (theme: Theme) =>
  ({
    // base tokens
    alignment: 'center',
    contentMarginHorizontal: 8,
    contentMarginVertical: 0,
    insetStyleProp: 'paddingHorizontal',
    insetSize: 0,
    lineBeforeFlex: 1,
    lineAfterFlex: 1,
    lineStyleProp: 'borderTopWidth',
    minWidth: 0,
    minHeight: 0,
    rootFlexDirection: 'row',
    thickness: 1,
    // for aligning the divider if alignContent !== 'center'
    alignStart: {
      alignment: 'flex-start',
      lineBeforeFlex: 0,
    },
    alignEnd: {
      alignment: 'flex-end',
      lineAfterFlex: 0,
    },
    // default insetSize if user specifies an inset
    inset: {
      insetSize: 16,
    },
    // vertical style overrides
    vertical: {
      contentMarginHorizontal: 0,
      contentMarginVertical: 8,
      insetStyleProp: 'paddingVertical',
      lineStyleProp: 'borderLeftWidth',
      rootFlexDirection: 'column',
      minHeight: 24,
      height: '100%',
    },
    hasChildren: {
      vertical: {
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
