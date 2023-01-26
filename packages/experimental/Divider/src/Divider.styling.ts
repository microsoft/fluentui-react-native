import { Theme } from '@fluentui-react-native/framework';
import { layoutStyles } from '@fluentui-react-native/tokens';
import { DividerTokens, DividerSlotProps, DividerAppearance } from './Divider.types';

export const getDividerSlotProps = (tokens: DividerTokens, theme: Theme): DividerSlotProps => {
  return {
    root: {
      style: {
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: tokens.vertical ? 'column' : 'row',
        ...layoutStyles.from(tokens, theme),
        ...(tokens.vertical
          ? {
              paddingVertical: tokens.insetSize,
              height: '100%',
            }
          : {
              paddingHorizontal: tokens.insetSize,
            }),
      },
    },
    beforeLine: {
      style: {
        flexBasis: 8,
        flex: tokens.flexBefore,
        borderColor: tokens.color || tokens.lineColor,
        borderStyle: 'solid',
        ...(tokens.vertical ? { borderLeftWidth: tokens.thickness } : { borderTopWidth: tokens.thickness }),
      },
    },
    afterLine: {
      style: {
        flexBasis: 8,
        flex: tokens.flexAfter,
        borderColor: tokens.color || tokens.lineColor,
        borderStyle: 'solid',
        ...(tokens.vertical ? { borderLeftWidth: tokens.thickness } : { borderTopWidth: tokens.thickness }),
      },
    },
    wrapper: {
      style: {
        flex: 0,
        ...(tokens.vertical ? { paddingVertical: tokens.contentPadding } : { paddingHorizontal: tokens.contentPadding }),
      },
    },
    text: {
      style: {
        color: tokens.color || tokens.contentColor,
      },
    },
    icon: {
      color: tokens.color || tokens.contentColor,
    },
  };
};

export const colorsFromAppearance = (appearance: DividerAppearance, theme: Theme): Pick<DividerTokens, 'contentColor' | 'lineColor'> => {
  switch (appearance) {
    case 'default':
      return {
        contentColor: theme.colors.neutralForeground2,
        lineColor: theme.colors.neutralStroke2,
      };
    case 'subtle':
      return {
        contentColor: theme.colors.neutralForeground3,
        lineColor: theme.colors.neutralStroke3,
      };
    case 'brand':
      return {
        contentColor: theme.colors.brandForeground1,
        lineColor: theme.colors.brandStroke1,
      };
    case 'strong': {
      return {
        contentColor: theme.colors.neutralForeground1,
        lineColor: theme.colors.neutralStroke1,
      };
    }
  }
};
