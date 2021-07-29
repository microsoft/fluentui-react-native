import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: 'neutralForeground3Brand',
      variant: 'bodyStandard',
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'button',
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
        backgroundColor: 'transparent',
        borderRadius: 2,
        marginBottom: 2,
        alignSelf: 'stretch',
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
    _precedence: ['selected', 'hovered', 'focused', 'disabled', 'pressed'],
    _overrides: {
      disabled: {
        tokens: {
          color: 'neutralForegroundDisabled',
        },
      },
      hovered: {
        tokens: {
          color: 'neutralForeground2Hover',
        },
        indicator: {
          style: {
            backgroundColor: 'neutralStroke1',
          },
        },
      },
      selected: {
        tokens: {
          color: 'neutralForeground1',
          variant: 'bodySemibold',
        },
        indicator: {
          style: {
            backgroundColor: 'brandStroke1',
          },
        },
        _overrides: {
          pressed: {
            indicator: {
              style: {
                backgroundColor: 'neutralStroke1',
              },
            },
          },
        },
      },

      pressed: {
        tokens: {
          color: 'neutralForeground2Pressed',
        },
        indicator: {
          style: {
            backgroundColor: 'brandStroke1',
          },
        },
      },

      focused: {
        tokens: {
          color: 'neutralForeground1',
          borderWidth: 2,
          borderColor: 'neutralForeground1',
          borderRadius: 4,
        },
        indicator: {
          style: {
            backgroundColor: 'brandStroke1',
          },
        },
      },
    },
  },
  tabsItemName,
];
