import { stackName, IStackType } from './Stack.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<IStackType> = [
  {
    root: {
      style: {
        display: 'flex',
      },
    },
    inner: {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'visible',
      },
    },
    _overrides: {
      horizontal: {
        root: {
          style: {
            flexDirection: 'row',
          },
        },
        _overrides: {
          reversed: {
            root: {
              style: {
                flexDirection: 'column-reverse',
              },
            },
          },
        },
      },
      reversed: {
        root: {
          style: {
            flexDirection: 'row-reverse',
          },
        },
      },
      verticalFill: {
        root: {
          style: {
            height: '100%',
          },
        },
      },
      wrap: {
        root: {
          style: {
            flexWrap: 'wrap',
            height: '100%',
            overflow: 'visible',
          },
        },
      },
    },
  },
  stackName,
];
