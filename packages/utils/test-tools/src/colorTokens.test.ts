import type { Theme } from '@fluentui-react-native/design/theming';

import { mockTheme } from './mockTheme';
import { getColorTokenSnapshot, resolveV0ColorTokens, resolveV1ColorTokens } from './colorTokens';

const theme: Theme = {
  ...mockTheme,
  colors: {
    ...mockTheme.colors,
    aliasColor: '#123456',
    chainedAlias: 'aliasColor',
  },
  components: {
    V0Example: {
      tokens: {
        borderColor: 'aliasColor',
      },
    },
    V1Example: {
      backgroundColor: 'chainedAlias',
    },
  },
};

describe('color token snapshots', () => {
  it('retains only color-bearing leaves with stable key ordering', () => {
    expect(
      getColorTokenSnapshot(
        {
          zColor: '#ffffff',
          size: 12,
          nested: {
            foreground: '#222222',
            width: 4,
            aColor: '#000000',
          },
        },
        theme,
      ),
    ).toEqual({
      nested: {
        aColor: '#000000',
        foreground: '#222222',
      },
      zColor: '#ffffff',
    });
  });

  it('resolves v0 settings, overrides, and palette aliases', () => {
    expect(
      resolveV0ColorTokens(
        [
          {
            tokens: {
              color: 'chainedAlias',
            },
            _overrides: {
              hovered: {
                tokens: {
                  backgroundColor: 'aliasColor',
                },
              },
            },
          },
          'V0Example',
        ],
        theme,
      ),
    ).toEqual({
      _overrides: {
        hovered: {
          tokens: {
            backgroundColor: '#123456',
          },
        },
      },
      tokens: {
        borderColor: '#123456',
        color: '#123456',
      },
    });
  });

  it('resolves v1 token layers, component entries, and palette aliases', () => {
    expect(
      resolveV1ColorTokens(
        [
          {
            color: 'aliasColor',
            hovered: {
              color: '#abcdef',
            },
          },
          'V1Example',
        ],
        theme,
      ),
    ).toEqual({
      backgroundColor: '#123456',
      color: '#123456',
      hovered: {
        color: '#abcdef',
      },
    });
  });
});
