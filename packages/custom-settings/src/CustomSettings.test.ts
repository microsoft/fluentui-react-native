import { IComponentSettings, mergeSettings } from '@uifabric/foundation-settings';
import { ISettingsEntry, ISettingsFromTheme } from './CustomSettings.types';
import { getThemedSettings, getCachedResolvedSettings } from './CustomSettings';

interface IMockTheme {
  palette: {
    buttonBackground?: string;
    buttonText?: string;
    buttonBorder?: string;
    buttonBackgroundHovered?: string;
    buttonTextHovered?: string;
    windowText?: string;
    windowBackground?: string;
  };
  typography: {
    fontSizes: {
      large?: number;
      medium?: number;
      small?: number;
    };
  };
}

const _theme: IMockTheme = {
  palette: {
    buttonTextHovered: 'bth',
    buttonBackground: 'bb',
    buttonBackgroundHovered: 'bbh',
    buttonBorder: 'bb',
    buttonText: 'bt',
    windowBackground: 'wb',
    windowText: 'wt'
  },
  typography: {
    fontSizes: {
      large: 14,
      medium: 12,
      small: 10
    }
  }
};

interface IMockProps {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  borderWidth?: number;
  borderColor?: string;
  value?: string;
}

type IMockButtonSettings = IComponentSettings<{
  root: IMockProps;
  content: IMockProps;
  icon: IMockProps;
}>;

const _lookup: { [key: string]: IMockButtonSettings } = {
  val1: {
    root: {
      value: 'foo',
      backgroundColor: 'red',
      color: 'val1',
      borderWidth: 2
    },
    content: {
      color: 'green',
      value: 'val1',
      fontSize: 10
    },
    icon: {
      color: 'black'
    },
    _precedence: ['primary', 'hovered', 'pressed'],
    _overrides: {
      primary: {
        root: {
          backgroundColor: 'purple'
        },
        _overrides: {
          hovered: {
            root: {
              backgroundColor: 'pink'
            }
          },
          pressed: {
            root: {
              backgroundColor: 'orange'
            }
          }
        }
      },
      hovered: {
        root: {
          backgroundColor: 'gray'
        }
      },
      pressed: {
        root: {
          backgroundColor: 'white'
        }
      }
    }
  },
  val2: {
    root: {
      color: '#1c1c1c',
      value: 'val2'
    }
  }
};

const val1rootHovered: IMockButtonSettings['root'] = {
  value: 'foo',
  backgroundColor: 'gray',
  color: 'val1',
  borderWidth: 2
};

const val1primaryHovered: IMockButtonSettings['root'] = {
  value: 'foo',
  backgroundColor: 'pink',
  color: 'val1',
  borderWidth: 2
};

function getSettings(_t: IMockTheme, name: string) {
  return _lookup[name];
}

type ICustomSettingsBlock = ISettingsEntry<IMockButtonSettings, IMockTheme>[];

const customSettings1: ICustomSettingsBlock = ['val1'];
const result1 = _lookup.val1;

const fragment2: IMockButtonSettings = {
  root: { borderWidth: 3, backgroundColor: 'yellow' },
  content: { value: 'cs1' },
  _precedence: ['hovered', 'pressed']
};

const themeFn2: ISettingsFromTheme<IMockButtonSettings, IMockTheme> = t => ({
  root: {
    color: t.palette.buttonText,
    borderColor: t.palette.buttonBackground
  },
  content: {
    color: t.palette.buttonText
  },
  _overrides: {
    hovered: {
      root: {
        color: t.palette.buttonTextHovered,
        backgroundColor: t.palette.buttonBackgroundHovered
      }
    }
  }
});

const customSettings2: ICustomSettingsBlock = [fragment2, 'val2', themeFn2];
const result2 = mergeSettings(fragment2, _lookup.val2, themeFn2(_theme));

describe('Custom settings tests', () => {
  test('getThemedSettings handles empty values', () => {
    const cache = {};
    const sNull = getThemedSettings(undefined, _theme, cache, 'foo', getSettings);
    expect(sNull).toEqual(undefined);
    const sEmpty = getThemedSettings([], _theme, cache, 'foo', getSettings);
    expect(sEmpty).toEqual(undefined);
  });

  test('getThemedSettings looks up in theme correctly', () => {
    const cache = {};
    const s1 = getThemedSettings(customSettings1, _theme, cache, 'foo', getSettings);
    expect(s1).toEqual(result1);
  });

  test('getThemedSettings merges correctly', () => {
    const cache = {};
    const s2 = getThemedSettings(customSettings2, _theme, cache, 'foo', getSettings);
    expect(s2).toEqual(result2);
  });

  test('getThemedSettings caches merge result', () => {
    const cache = {};
    const s2a = getThemedSettings(customSettings2, _theme, cache, 'foo', getSettings);
    const s2b = getThemedSettings(customSettings2, _theme, cache, 'foo', getSettings);
    expect(s2a).toBe(s2b);
  });

  test('getCachedResolvedSettings resolves overrides', () => {
    const cache = {};
    const { settings, key } = getCachedResolvedSettings(customSettings1, _theme, cache, 'foo', { hovered: true }, getSettings);
    expect(key).toEqual('foo-hovered');
    expect(settings.root).toEqual(val1rootHovered);
  });

  test('getCachedResolvedSettings resolves multiple overrides', () => {
    const { settings, key } = getCachedResolvedSettings(customSettings1, _theme, {}, 'foo', { hovered: true, primary: true }, getSettings);
    expect(key).toEqual('foo-primary-hovered');
    expect(settings.root).toEqual(val1primaryHovered);
  });
});
