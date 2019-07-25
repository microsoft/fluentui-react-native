import { IPalette, IPartialPalette } from './Color.types';
import { resolvePartialPalette } from './Color';

const palette = {
  bodyBackground: 'darkgray',
  bodyText: 'rgb(127,3,11)'
} as IPalette;

const partialPalette: IPartialPalette = {
  bodyBackground: 'hsl(90,1%,2%)',
  bodySubtext: 'rgb(0,129,5)'
};

describe('Palette tests', () => {
  test('resolvePartialPalette returns the full palette when the partial palette is not provided', () => {
    const resolved = resolvePartialPalette(palette);
    expect(resolved).toBe(palette);
  });

  test('resolvePartialPalette returns a copy of the full palette when partial palette is empty', () => {
    const resolved = resolvePartialPalette(palette, {});
    expect(resolved).toEqual(palette);
    expect(resolved).not.toBe(palette);
  });

  test('resolvePartialPalette returns a blend of the partial palette and the full palette', () => {
    const resolved = resolvePartialPalette(palette, partialPalette);
    expect(resolved).toEqual({
      bodyBackground: 'hsl(90,1%,2%)',
      bodyText: 'rgb(127,3,11)',
      bodySubtext: 'rgb(0,129,5)'
    });
  });
});
