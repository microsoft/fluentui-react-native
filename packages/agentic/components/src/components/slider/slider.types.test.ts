import type { SliderProps } from '../../macos';

describe('Slider types', () => {
  it('requires an independently named pair for a range', () => {
    const single: SliderProps = { accessibilityLabel: 'Volume', defaultValue: 20 };
    const pair: SliderProps = {
      accessibilityLabel: 'Price',
      mode: 'range',
      defaultValue: [20, 40],
      thumbLabels: ['Minimum price', 'Maximum price'],
    };
    // @ts-expect-error Each range endpoint needs a name.
    const unnamed: SliderProps = { accessibilityLabel: 'Price', mode: 'range', defaultValue: [20, 40] };
    // @ts-expect-error Single mode does not accept a range value.
    const crossedContract: SliderProps = { accessibilityLabel: 'Volume', value: [20, 40] };
    expect([single, pair, unnamed, crossedContract]).toHaveLength(4);
  });
});
