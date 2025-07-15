import type { ColorValue } from 'react-native';

import type { StyleProp } from '@fluentui-react-native/framework-base';

import { mergeSettings } from './Settings';
import type { IComponentSettings } from './Settings.types';

interface IProps {
  root: {
    prop1: string;
    className?: string;
    style: StyleProp<{
      fontFamily?: string;
      fontWeight?: 'light' | 'normal' | 'bold';
      fontSize?: number;
      textColor?: ColorValue;
    }>;
  };
  slot1: {
    background?: string;
  };
}

const settingsDefault: IComponentSettings<IProps> = {
  root: {
    className: 'foo bar',
    style: {
      fontFamily: 'Calibri',
      fontWeight: 'normal',
      fontSize: 12,
      textColor: 'black',
    },
  },
};

const settingsBase: IComponentSettings<IProps> = {
  root: {
    className: 'baz',
    style: {
      fontWeight: 'bold',
      fontSize: 16,
      textColor: 'blue',
    },
  },
  _overrides: {
    hover: {
      root: {
        style: {
          textColor: 'lightblue',
        },
      },
    },
  },
};

const settingsNormal: IComponentSettings<IProps> = {
  root: {
    style: [
      {
        fontFamily: 'Calibri Body',
      },
      {
        fontSize: 10,
        textColor: 'darkgray',
      },
    ],
  },
  _overrides: {
    hover: {
      root: {
        style: {
          fontWeight: 'bold',
        },
      },
    },
  },
};

describe('Merge settings tests', () => {
  test('mergeSettings produces an empty settings when no settings are given', () => {
    const merged = mergeSettings();
    expect(merged).toEqual(undefined);
  });

  test('merging one settings without overrides produces an object that matches the input', () => {
    const merged = mergeSettings(settingsDefault);
    expect(merged).toEqual(settingsDefault);
  });

  test('merging one settings without overrides does not produce a new object', () => {
    const merged = mergeSettings(settingsDefault);
    expect(merged).toBe(settingsDefault);
  });

  test('merging one settings produces an object that matches the input', () => {
    const merged = mergeSettings(settingsNormal);
    expect(merged).toEqual(settingsNormal);
  });

  test('merging one settings does not produce a new object', () => {
    const merged = mergeSettings(settingsNormal);
    expect(merged).toBe(settingsNormal);
  });

  test("merging one settings produces an object with an 'overrides' prop identical to the input settings overrides prop", () => {
    const merged = mergeSettings(settingsNormal);
    expect(merged._overrides).toBe(settingsNormal._overrides);
  });

  test('merging two settings, one without overrides, produces a blended object', () => {
    const merged = mergeSettings(settingsDefault, settingsBase);
    expect(merged).toEqual({
      root: {
        className: 'foo bar baz',
        style: {
          fontFamily: 'Calibri',
          fontWeight: 'bold',
          fontSize: 16,
          textColor: 'blue',
        },
      },
      _overrides: {
        hover: {
          root: {
            style: {
              textColor: 'lightblue',
            },
          },
        },
      },
    });
  });

  test(
    "merging two settings, one without overrides, produces an object with an 'overrides' prop " +
      'identical to the input settings overrides prop',
    () => {
      const merged = mergeSettings(settingsDefault, settingsBase);
      expect(merged._overrides).toBe(settingsBase._overrides);
    },
  );

  test('merging two settings, both with overrides, produces a blended object', () => {
    const merged = mergeSettings(settingsBase, settingsNormal);
    expect(merged).toEqual({
      root: {
        className: 'baz',
        style: {
          fontFamily: 'Calibri Body',
          fontWeight: 'bold',
          fontSize: 10,
          textColor: 'darkgray',
        },
      },
      _overrides: {
        hover: {
          root: {
            style: {
              textColor: 'lightblue',
              fontWeight: 'bold',
            },
          },
        },
      },
    });
  });

  test('merging three settings produces a blended object', () => {
    const merged = mergeSettings(settingsDefault, settingsBase, settingsNormal);
    expect(merged).toEqual({
      root: {
        className: 'foo bar baz',
        style: {
          fontFamily: 'Calibri Body',
          fontWeight: 'bold',
          fontSize: 10,
          textColor: 'darkgray',
        },
      },
      _overrides: {
        hover: {
          root: {
            style: {
              textColor: 'lightblue',
              fontWeight: 'bold',
            },
          },
        },
      },
    });
  });
});
