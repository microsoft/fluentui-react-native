import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: 'neutralForeground3Brand',
      variant: 'bodyStandard',
      borderWidth: 2,
      borderColor: 'transparent',
      borderRadius: 4,
      indicatorColor: 'transparent',
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'tab',
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        justifyContent: 'center',
      },
    } as IViewProps,
    indicator: {
      style: {
        minHeight: 2,
        borderRadius: 2,
        marginBottom: 2,
        alignSelf: 'stretch',
        marginHorizontal: 10,
      },
    },
    stack: {
      style: {
        display: 'flex',
        marginHorizontal: 10,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 32,
        justifyContent: 'center',
      },
    },
    _precedence: ['hovered', 'selected', 'focused', 'disabled', 'pressed'],
    _overrides: {
      disabled: {
        tokens: {
          color: 'neutralForegroundDisabled',
        },
      },
      hovered: {
        tokens: {
          color: 'neutralForeground2Hover',
          indicatorColor: 'neutralStroke1'
        },
      },
      selected: {
        tokens: {
          color: 'neutralForeground1',
          variant: 'bodySemibold',
          indicatorColor: 'brandStroke1'
        },
        _overrides: {
          pressed: {
            tokens: {
              indicatorColor: 'neutralStroke1',
            },
          },
        },
      },

      pressed: {
        tokens: {
          color: 'neutralForeground2Pressed',
          indicatorColor: 'brandStroke1',
        },
      },

      focused: {
        tokens: {
          color: 'neutralForeground1',
          borderColor: 'neutralForeground1',
        },
      },
    },
  },
  tabsItemName,
];
