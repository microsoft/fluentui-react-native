import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: '#616161',
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
          color: '#BDBDBD',
        },
      },
      hovered: {
        tokens: {
          color: '#242424',
        },
        indicator: {
          style: {
            backgroundColor: '#D1D1D1',
          },
        },
      },
      selected: {
        tokens: {
          color: '#242424',
          variant: 'bodySemibold',
        },
        indicator: {
          style: {
            backgroundColor: '#0078D4',
          },
        },
        _overrides: {
          pressed: {
            indicator: {
              style: {
                backgroundColor: '#D1D1D1',
              },
            },
          },
        },
      },

      pressed: {
        tokens: {
          color: '#242424',
        },
        indicator: {
          style: {
            backgroundColor: '#0078D4',
          },
        },
      },

      focused: {
        tokens: {
          color: '#242424',
          borderWidth: 2,
          borderColor: '#242424',
          borderRadius: 4,
        },
        indicator: {
          style: {
            backgroundColor: '#0078D4',
          },
        },
      },
    },
  },
  tabsItemName,
];
