import type { FieldBinding, FieldProps } from '../../index';

describe('Field props', () => {
  it('uses an explicit binding rather than treating children as a control', () => {
    const valid: FieldProps = { label: 'Code', renderControl: (binding: FieldBinding) => binding.label };
    // @ts-expect-error Field requires a binding adapter.
    const missing: FieldProps = { label: 'Code' };
    // @ts-expect-error Labels are localized strings, not control nodes.
    const invalid: FieldProps = { ...valid, label: 10 };
    expect([valid, missing, invalid]).toHaveLength(3);
  });
});
