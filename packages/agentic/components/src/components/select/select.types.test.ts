import type { SelectProps } from '../../macos';

describe('Select types', () => {
  it('provides a native single-choice API without popup controls', () => {
    const valid: SelectProps = { accessibilityLabel: 'Language', options: [{ value: 'en', label: 'English' }], value: null };
    // @ts-expect-error Opening belongs to the native picker.
    const invalid: SelectProps = { ...valid, open: true };
    expect([valid, invalid]).toHaveLength(2);
  });
});
