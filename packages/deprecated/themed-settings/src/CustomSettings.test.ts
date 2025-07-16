import type { ColorValue } from 'react-native';

import { getMemoCache } from '@fluentui-react-native/framework-base';
import type { IComponentSettings } from '@uifabricshared/foundation-settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import { mergeBaseSettings, getThemedSettings } from './CustomSettings';
import type { ISettingsEntry, ISettingsFromTheme } from './CustomSettings.types';

interface IMockTheme {
  palette: {
    buttonBackground?: ColorValue;
    buttonText?: ColorValue;
    buttonBorder?: ColorValue;
    buttonBackgroundHovered?: ColorValue;
    buttonTextHovered?: ColorValue;
    windowText?: ColorValue;
    windowBackground?: ColorValue;
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
    windowText: 'wt',
  },
  typography: {
    fontSizes: {
      large: 14,
      medium: 12,
      small: 10,
    },
  },
};

interface IMockProps {
  backgroundColor?: ColorValue;
  color?: ColorValue;
  fontSize?: number;
  borderWidth?: number;
  borderColor?: ColorValue;
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
      borderWidth: 2,
    },
    content: {
      color: 'green',
      value: 'val1',
      fontSize: 10,
    },
    icon: {
      color: 'black',
    },
    _precedence: ['primary', 'hovered', 'pressed'],
    _overrides: {
      primary: {
        root: {
          backgroundColor: 'purple',
        },
        _overrides: {
          hovered: {
            root: {
              backgroundColor: 'pink',
            },
          },
          pressed: {
            root: {
              backgroundColor: 'orange',
            },
          },
        },
      },
      hovered: {
        root: {
          backgroundColor: 'gray',
        },
      },
      pressed: {
        root: {
          backgroundColor: 'white',
        },
      },
    },
  },
  val2: {
    root: {
      color: '#1c1c1c',
      value: 'val2',
    },
  },
};

const val1rootHovered: IMockButtonSettings['root'] = {
  value: 'foo',
  backgroundColor: 'gray',
  color: 'val1',
  borderWidth: 2,
};

const val1primaryHovered: IMockButtonSettings['root'] = {
  value: 'foo',
  backgroundColor: 'pink',
  color: 'val1',
  borderWidth: 2,
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
  _precedence: ['hovered', 'pressed'],
};

const themeFn2: ISettingsFromTheme<IMockButtonSettings, IMockTheme> = (t) => ({
  root: {
    color: t.palette.buttonText,
    borderColor: t.palette.buttonBackground,
  },
  content: {
    color: t.palette.buttonText,
  },
  _overrides: {
    hovered: {
      root: {
        color: t.palette.buttonTextHovered,
        backgroundColor: t.palette.buttonBackgroundHovered,
      },
    },
  },
});

const customSettings2: ICustomSettingsBlock = [fragment2, 'val2', themeFn2];
const result2 = mergeSettings(fragment2, _lookup.val2, themeFn2(_theme));

describe('Custom settings tests', () => {
  test('mergeBaseSettings handles empty values', () => {
    const sNull = mergeBaseSettings(undefined, _theme, getSettings);
    expect(sNull).toEqual(undefined);
    const sEmpty = mergeBaseSettings([], _theme, getSettings);
    expect(sEmpty).toEqual(undefined);
  });

  test('mergeBaseSettings looks up in theme correctly', () => {
    const s1 = mergeBaseSettings(customSettings1, _theme, getSettings);
    expect(s1).toEqual(result1);
  });

  test('mergeBaseSettings merges correctly', () => {
    const s2 = mergeBaseSettings(customSettings2, _theme, getSettings);
    expect(s2).toEqual(result2);
  });

  test('getThemedSettings caches merge result', () => {
    const newCache = getMemoCache();
    const { settings } = getThemedSettings(customSettings2, _theme, newCache, {}, getSettings);
    expect(getThemedSettings(customSettings2, _theme, newCache, {}, getSettings).settings).toBe(settings);
  });

  test('getThemedSettings resolves overrides', () => {
    const newCache = getMemoCache();
    const { settings } = getThemedSettings(customSettings1, _theme, newCache, { hovered: true }, getSettings);
    expect(settings.root).toEqual(val1rootHovered);
  });

  test('getThemedSettings resolves multiple overrides', () => {
    const newCache = getMemoCache();
    const { settings } = getThemedSettings(customSettings1, _theme, newCache, { hovered: true, primary: true }, getSettings);
    expect(settings.root).toEqual(val1primaryHovered);
  });
});
