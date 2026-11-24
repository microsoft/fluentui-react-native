import type { SwatchProps } from '../../index';

describe('Swatch props', () => {
  it('requires a value and one discriminated sample', () => {
    const good: SwatchProps = { value: 'black', sample: { kind: 'color', color: 'black' }, accessibilityLabel: 'Black' };
    // @ts-expect-error A picker owns the value and selection.
    const uncontrolled: SwatchProps = { ...good, defaultSelected: true };
    // @ts-expect-error A product color is not automatically an accessible name.
    const unnamed: SwatchProps = { value: 'black', sample: good.sample };
    expect([good, uncontrolled, unnamed]).toHaveLength(3);
  });
});
