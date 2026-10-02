import { resolveAccessibilityAction } from './resolveAccessibilityAction';

jest.mock('react-native', () => {
  throw new Error('The accessibility resolver must not load React Native at runtime.');
});

describe('resolveAccessibilityAction', () => {
  it.each([
    ['windows', 'toggle', 'toggle'],
    ['windows', 'select', 'select'],
    ['windows', 'expand', 'expand'],
    ['windows', 'collapse', 'collapse'],
    ['win32', 'toggle', 'Toggle'],
    ['win32', 'select', 'Select'],
    ['win32', 'expand', 'Expand'],
    ['win32', 'collapse', 'Collapse'],
    ['macos', 'toggle', 'Toggle'],
    ['macos', 'select', 'Select'],
    ['macos', 'expand', 'Expand'],
    ['macos', 'collapse', 'Collapse'],
  ] as const)('resolves %s %s to the declared native name %s', (platform, action, name) => {
    expect(resolveAccessibilityAction(action, platform)).toEqual({ name, accessibilityActions: [{ name }] });
  });

  it.each(['ios', 'android', 'web'])('preserves existing custom names on %s without claiming native patterns', (platform) => {
    expect(resolveAccessibilityAction('toggle', platform).name).toBe('Toggle');
    expect(resolveAccessibilityAction('select', platform).name).toBe('Select');
    expect(resolveAccessibilityAction('expand', platform).name).toBe('Expand');
    expect(resolveAccessibilityAction('collapse', platform).name).toBe('Collapse');
  });

  it.each([
    ['toggle', 'Toggle', 'toggle'],
    ['select', 'Select', 'select'],
    ['expand', 'Expand', 'expand'],
    ['collapse', 'Collapse', 'collapse'],
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

  it.each(['windows', 'win32', 'macos'])('composes expansion actions without duplicate declarations on %s', (platform) => {
    const supplied = Object.freeze([
      { name: 'Expand', label: 'Open' },
      { name: 'expand', label: 'Duplicate open' },
      { name: 'Collapse', label: 'Close' },
      { name: 'collapse', label: 'Duplicate close' },
      { name: 'custom', label: 'Other action' },
    ]);
    const expansion = resolveAccessibilityAction('expand', platform, supplied);
    const collapse = resolveAccessibilityAction('collapse', platform, expansion.accessibilityActions);
    expect(collapse.accessibilityActions).toEqual([
      { name: expansion.name, label: 'Open' },
      { name: collapse.name, label: 'Close' },
      supplied[4],
    ]);
    expect(resolveAccessibilityAction('expand', platform, collapse.accessibilityActions).accessibilityActions).toBe(
      collapse.accessibilityActions,
    );
  });
});
