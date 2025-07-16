import type { ColorValue } from 'react-native';

import { immutableMerge } from '@fluentui-react-native/framework-base';

import { createThemeRegistry } from './Registry';
import type { IThemeRegistry } from './Registry.types';

interface IFakeStyle {
  textColor?: string;
  backgroundColor?: ColorValue;
  fontFamily?: string;
  fontSize?: string | number;
}

interface IFakeTheme {
  palette: {
    bodyBackground?: ColorValue;
    bodyText?: ColorValue;
  };
  typography: {
    families?: {
      primary?: string;
      monospace?: string;
    };
  };
  spacing: {
    s2?: string;
    s1?: string;
    m?: string;
    l1?: string;
    l2?: string;
  };
  settings: {
    [key: string]: {
      root: IFakeStyle;
    };
  };
}

const _platformDefaults: IFakeTheme = {
  palette: {
    bodyBackground: '#000000',
    bodyText: '#ffffff',
  },
  typography: {
    families: {
      primary: 'Platform Font Primary',
      monospace: 'Platform Font Monospace',
    },
  },
  spacing: { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' },
  settings: {
    base: {
      root: {
        textColor: 'black',
        fontFamily: 'Verdana',
        fontSize: 10,
      },
    },
  },
};

const _ocean: Partial<IFakeTheme> = {
  settings: {
    base: {
      root: {
        textColor: 'blue',
        fontFamily: 'Arial',
      },
    },
    MyButton: {
      root: {
        fontSize: 12,
      },
    },
  },
};

const _platformDefaultsMergedWithOcean: IFakeTheme = {
  palette: {
    bodyBackground: '#000000',
    bodyText: '#ffffff',
  },
  typography: {
    families: {
      primary: 'Platform Font Primary',
      monospace: 'Platform Font Monospace',
    },
  },
  spacing: { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' },
  settings: {
    base: {
      root: {
        textColor: 'blue',
        fontFamily: 'Arial',
        fontSize: 10,
      },
    },
    MyButton: {
      root: {
        fontSize: 12,
      },
    },
  },
};

function processor(parent: IFakeTheme): Partial<IFakeTheme> {
  return {
    settings: {
      base: {
        root: {
          textColor: 'light' + (parent.settings.base.root as IFakeStyle).textColor,
          fontFamily: (parent.settings.base.root as IFakeStyle).fontFamily + ' Light',
          fontSize: <number>(parent.settings.base.root as IFakeStyle).fontSize - 2,
        },
      },
    },
  };
}

const _platformDefaultsMergedWithProcessor: IFakeTheme = {
  palette: {
    bodyBackground: '#000000',
    bodyText: '#ffffff',
  },
  typography: {
    families: {
      primary: 'Platform Font Primary',
      monospace: 'Platform Font Monospace',
    },
  },
  spacing: { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' },
  settings: {
    base: {
      root: {
        textColor: 'lightblack',
        fontFamily: 'Verdana Light',
        fontSize: 8,
      },
    },
  },
};

function fakeThemeResolver(parent: IFakeTheme, partial?: Partial<IFakeTheme>): IFakeTheme {
  let newTheme = immutableMerge(parent, partial) as IFakeTheme;
  if (newTheme === parent) {
    newTheme = { ...newTheme };
  }
  return newTheme;
}

function createTestThemeRegistry(platformTheme: IFakeTheme): IThemeRegistry<IFakeTheme, Partial<IFakeTheme>> {
  return createThemeRegistry<IFakeTheme, Partial<IFakeTheme>>(platformTheme, fakeThemeResolver);
}

describe('Theme registry tests', () => {
  test('getting the platform theme causes an exception', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    expect(() => {
      registry.getTheme('__platform');
    }).toThrow();
  });

  test('setting the platform theme causes an exception', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    expect(() => {
      registry.setTheme({}, '__platform');
    }).toThrow();
  });

  test('default theme matches platform theme', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    const theme = registry.getTheme();
    expect(theme).toEqual(_platformDefaults);
  });

  test('change the default theme', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    registry.setTheme(_ocean);
    const theme = registry.getTheme();
    expect(theme).toEqual(_platformDefaultsMergedWithOcean);
  });

  test('create a theme', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    registry.setTheme(_ocean, 'ocean');
    const theme = registry.getTheme('ocean');
    expect(theme).toEqual(_platformDefaultsMergedWithOcean);
  });

  test('create a theme which uses a processor', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    registry.setTheme(processor, 'processed');
    const theme = registry.getTheme('processed');
    expect(theme).toEqual(_platformDefaultsMergedWithProcessor);
  });

  test('creating a theme that refers to a non-existent parent causes an exception', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    expect(() => {
      registry.setTheme(_ocean, 'ocean', 'does not exist');
    }).toThrow();
  });

  test('creating a theme, then updating it to parent to itself causes an exception', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    registry.setTheme(_ocean, 'ocean');
    expect(() => {
      registry.setTheme(_ocean, 'ocean', 'ocean');
    }).toThrow();
  });

  test('creating two themes that parent to each other causes an exception', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    registry.setTheme(_ocean, 'ocean');
    registry.setTheme(_ocean, 'ocean2', 'ocean');
    expect(() => {
      registry.setTheme(_ocean, 'ocean', 'ocean2');
    }).toThrow();
  });

  test('creating three themes that parent to each other causes an exception', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    registry.setTheme(_ocean, 'ocean');
    registry.setTheme(_ocean, 'ocean2', 'ocean');
    registry.setTheme(_ocean, 'ocean3', 'ocean2');
    expect(() => {
      registry.setTheme(_ocean, 'ocean', 'ocean3');
    }).toThrow();
  });

  test('updating the platform defaults changes the default theme', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    const theme = registry.getTheme();
    registry.updatePlatformDefaults(_platformDefaultsMergedWithOcean);
    const themeUpdated = registry.getTheme();
    expect(themeUpdated).not.toEqual(theme);
    expect(themeUpdated).toEqual(_platformDefaultsMergedWithOcean);
  });

  test('invalidation event fires for default theme when platform theme changes', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    const onInvalidate = jest.fn();
    registry.addEventListener({ onInvalidate });

    registry.getTheme();
    registry.updatePlatformDefaults(_platformDefaultsMergedWithOcean);

    expect(onInvalidate.mock.calls.length).toEqual(1);
    expect(onInvalidate.mock.calls[0][0]).toEqual('');
  });

  test('invalidation event fires for child theme when its parent changes', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    const onInvalidate = jest.fn();
    registry.addEventListener({ onInvalidate });

    registry.setTheme(_ocean, 'ocean');
    registry.getTheme('ocean');
    registry.setTheme({ settings: { View: { root: { backgroundColor: 'red' } } } });

    expect(onInvalidate.mock.calls.length).toEqual(2);
    expect(onInvalidate.mock.calls[0][0]).toEqual('');
    expect(onInvalidate.mock.calls[1][0]).toEqual('ocean');
  });

  test('invalidation event does not fire when listener is removed', () => {
    const registry = createTestThemeRegistry(_platformDefaults);
    const onInvalidate = jest.fn();
    const listener = { onInvalidate };
    registry.addEventListener(listener);
    registry.removeEventListener(listener);

    registry.getTheme();
    registry.updatePlatformDefaults(_platformDefaultsMergedWithOcean);

    expect(onInvalidate.mock.calls.length).toEqual(0);
  });
});
