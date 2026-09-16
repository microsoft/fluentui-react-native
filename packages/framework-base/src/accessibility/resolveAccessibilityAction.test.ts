import { resolveAccessibilityAction } from './resolveAccessibilityAction';

jest.mock('react-native', () => {
  throw new Error('The accessibility resolver must not load React Native at runtime.');
});

describe('resolveAccessibilityAction', () => {
  it.each([
    ['windows', 'toggle', 'toggle'],
    ['windows', 'select', 'select'],
    ['win32', 'toggle', 'Toggle'],
    ['win32', 'select', 'Select'],
    ['macos', 'toggle', 'Toggle'],
    ['macos', 'select', 'Select'],
  ] as const)('resolves %s %s to the declared native name %s', (platform, action, name) => {
    expect(resolveAccessibilityAction(action, platform)).toEqual({ name, accessibilityActions: [{ name }] });
  });

  it.each(['ios', 'android', 'web'])('preserves existing custom names on %s without claiming native patterns', (platform) => {
    expect(resolveAccessibilityAction('toggle', platform).name).toBe('Toggle');
    expect(resolveAccessibilityAction('select', platform).name).toBe('Select');
  });

  it.each([
    ['toggle', 'Toggle', 'toggle'],
    ['select', 'Select', 'select'],
  ] as const)('merges %s spellings while retaining caller order and labels', (action, titleCase, lowerCase) => {
    const custom = Object.freeze({ name: 'custom', label: 'More options' });
    const supplied = Object.freeze([
      custom,
      Object.freeze({ name: titleCase }),
      Object.freeze({ name: lowerCase, label: 'Change value' }),
      Object.freeze({ name: titleCase, label: 'Later label' }),
    ]);

    for (const platform of ['windows', 'win32', 'macos']) {
      const expectedName = platform === 'windows' ? lowerCase : titleCase;
      const resolved = resolveAccessibilityAction(action, platform, supplied);
      expect(resolved.name).toBe(expectedName);
      expect(resolved.accessibilityActions).toEqual([custom, { name: expectedName, label: 'Change value' }]);
      expect(resolved.accessibilityActions[0]).toBe(custom);
    }
    expect(supplied[1]).toEqual({ name: titleCase });
  });

  it('preserves an already normalized caller array', () => {
    const actions = Object.freeze([
      { name: 'custom', label: 'More' },
      { name: 'toggle', label: 'Change' },
    ]);
    expect(resolveAccessibilityAction('toggle', 'windows', actions).accessibilityActions).toBe(actions);
  });

  it('prepends a missing action and deduplicates exact custom names without changing their case', () => {
    const actions = Object.freeze([
      { name: 'custom' },
      { name: 'custom', label: 'More' },
      { name: 'custom', label: 'Later' },
      { name: 'Custom', label: 'Distinct action' },
      { name: 'TOGGLE', label: 'Not an alias' },
      { name: 'Select', label: 'Not owned by this toggle' },
    ]);
    expect(resolveAccessibilityAction('toggle', 'windows', actions).accessibilityActions).toEqual([
      { name: 'toggle' },
      { name: 'custom', label: 'More' },
      { name: 'Custom', label: 'Distinct action' },
      { name: 'TOGGLE', label: 'Not an alias' },
      { name: 'Select', label: 'Not owned by this toggle' },
    ]);
  });

  it('preserves an explicitly empty label rather than replacing it', () => {
    expect(
      resolveAccessibilityAction('toggle', 'windows', [
        { name: 'Toggle', label: '' },
        { name: 'toggle', label: 'Later' },
      ]).accessibilityActions,
    ).toEqual([{ name: 'toggle', label: '' }]);
  });
});
