import { IComponentSettings } from './Settings.types';
import { resolveSettingsOverrides } from './Settings';

interface IProps {
  root: {
    fontFamily?: string;
    fontWeight?: 'light' | 'normal' | 'bold';
    fontSize?: number;
  };
}

const settingsBase: IComponentSettings<IProps> = {
  root: {
    fontFamily: 'Arial'
  },
  _precedence: ['hover', 'hover2'],
  _overrides: {
    hover: {
      root: {
        fontWeight: 'bold',
        fontSize: 20
      }
    },
    hover2: {
      root: {
        fontWeight: 'light',
        fontSize: 5
      }
    }
  }
};

describe('Override settings tests', () => {
  test('applyOverrides returns the input object when no overrides are given', () => {
    const overridden = resolveSettingsOverrides(settingsBase);
    expect(overridden).toBe(settingsBase);
  });

  test('applyOverrides returns the input object when the override does not exist', () => {
    const overridden = resolveSettingsOverrides(settingsBase, { foo: true });
    expect(overridden).toBe(settingsBase);
  });

  test('applyOverrides applies the hover2 override using only the input', () => {
    const overridden = resolveSettingsOverrides(settingsBase, { hover2: true });
    expect(overridden).toEqual({
      root: {
        fontFamily: 'Arial',
        fontWeight: 'light',
        fontSize: 5
      },
      _precedence: ['hover', 'hover2'],
      _overrides: {
        hover: {
          root: {
            fontWeight: 'bold',
            fontSize: 20
          }
        },
        hover2: {
          root: {
            fontWeight: 'light',
            fontSize: 5
          }
        }
      }
    });
  });

  test('applyOverrides applies the hover override, followed by the hover2 override', () => {
    const overridden = resolveSettingsOverrides(settingsBase, { hover2: true, hover: true });
    expect(overridden).toEqual({
      root: {
        fontFamily: 'Arial',
        fontWeight: 'light',
        fontSize: 5
      },
      _precedence: ['hover', 'hover2'],
      _overrides: {
        hover: {
          root: {
            fontWeight: 'bold',
            fontSize: 20
          }
        },
        hover2: {
          root: {
            fontWeight: 'light',
            fontSize: 5
          }
        }
      }
    });
  });
});
