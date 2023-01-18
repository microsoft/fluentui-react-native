import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { DividerTokens } from './Divider.types';

export const defaultDividerTokens: TokenSettings<DividerTokens, Theme> = () =>
  ({
    alignment: 'center',
    appearance: 'default',
    contentMarginHorizontal: 8,
    contentMarginVertical: 0,
    insetSize: 0,
    lineBeforeFlex: 1,
    lineAfterFlex: 1,
    rootFlexDirection: 'row',
    thickness: 1,
    alignStart: {
      alignment: 'flex-start',
      lineBeforeFlex: 0,
    },
    alignEnd: {
      alignment: 'flex-end',
      lineAfterFlex: 0,
    },
    hasChildren: {
      vertical: {
        minHeight: 84,
      },
    },
    hasInset: {
      insetSize: 16,
    },
    vertical: {
      contentMarginHorizontal: 0,
      contentMarginVertical: 8,
      rootFlexDirection: 'column',
      minHeight: 24,
      height: '100%',
    },
  } as DividerTokens);
