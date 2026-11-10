import { View } from 'react-native';

import { render } from '../renderWithTheme';

import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';
import { createSizedIconSource, pickNearestSize } from './sizedIconSource';

/** Draws a view that records the optical size it stands for in `nativeID`. */
function createGlyph(size: number): SvgIconSource {
  return function Glyph(props: IconElementProps) {
    return <View {...props} nativeID={`glyph-${size}`} />;
  };
}

const SizedIcon = createSizedIconSource({ 12: createGlyph(12), 16: createGlyph(16), 20: createGlyph(20), 24: createGlyph(24) }, 'Test');

async function renderGlyph(props: IconElementProps) {
  const component = await render(<SizedIcon testID="icon" {...props} />);
  return component.getByTestId('icon');
}

describe('pickNearestSize', () => {
  it.each([
    { requested: 17, sizes: [16, 20], expected: 16 },
    { requested: 19, sizes: [16, 20], expected: 20 },
    { requested: 18, sizes: [16, 20], expected: 20 },
    { requested: 14, sizes: [24, 12, 16], expected: 16 },
    { requested: 4, sizes: [16, 20], expected: 16 },
    { requested: 100, sizes: [16, 20], expected: 20 },
    { requested: 20, sizes: [16], expected: 16 },
  ])('picks $expected from $sizes for $requested', ({ requested, sizes, expected }) => {
    expect(pickNearestSize(sizes, requested)).toBe(expected);
  });
});

describe('createSizedIconSource', () => {
  it.each([
    { height: 12, width: 12, glyph: 12 },
    { height: 16, width: 16, glyph: 16 },
    { height: 18, width: 18, glyph: 20 },
    { height: 40, width: 40, glyph: 24 },
    { height: 14, width: 14, glyph: 16 },
    { height: 24, width: 12, glyph: 12 },
    { height: 12, width: 24, glyph: 12 },
    { height: 16, width: undefined, glyph: 16 },
    { height: undefined, width: 24, glyph: 24 },
    { height: 0, width: 16, glyph: 16 },
    { height: NaN, width: 24, glyph: 24 },
  ])('draws the $glyph glyph for $height by $width', async ({ height, width, glyph }) => {
    expect((await renderGlyph({ height, width })).props.nativeID).toBe(`glyph-${glyph}`);
  });

  it.each([
    { height: undefined, width: undefined },
    { height: 0, width: 0 },
    { height: -8, width: undefined },
    { height: NaN, width: NaN },
    { height: undefined, width: Infinity },
  ])('draws the 20 glyph when height is $height and width is $width', async ({ height, width }) => {
    expect((await renderGlyph({ height, width })).props.nativeID).toBe('glyph-20');
  });

  it('draws the chosen glyph at the requested size with every other prop', async () => {
    const glyph = await renderGlyph({ accessibilityLabel: 'Star', color: 'red', height: 18, width: 22 });

    expect(glyph.props).toMatchObject({
      accessibilityLabel: 'Star',
      color: 'red',
      height: 18,
      nativeID: 'glyph-20',
      testID: 'icon',
      width: 22,
    });
  });

  it('rejects an empty glyph ladder', () => {
    expect(() => createSizedIconSource({}, 'Empty')).toThrow('Empty needs at least one glyph.');
  });
});
