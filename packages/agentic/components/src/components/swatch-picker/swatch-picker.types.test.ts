import type { SwatchPickerProps } from '../../index';

describe('SwatchPicker props', () => {
  it('uses one source kind for a collection', () => {
    const blue = { value: 'blue', accessibilityLabel: 'Blue', sample: { kind: 'color', color: '#70a0df' } } as const;
    const linen = { value: 'linen', accessibilityLabel: 'Linen', sample: { kind: 'image', source: { uri: 'linen.png' } } } as const;
    const valid: SwatchPickerProps = { accessibilityLabel: 'Finish', items: [blue] };
    // @ts-expect-error A picker does not mix color and image samples.
    const mixed: SwatchPickerProps = { ...valid, items: [blue, linen] };
    expect([valid, mixed]).toHaveLength(2);
  });
});
