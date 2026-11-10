import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

/** Size used to pick a glyph when the caller sets no width or height. It is Fluent's default icon size. */
const defaultRequestedSize = 20;

function isUsableSize(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function getRequestedSize({ height, width }: IconElementProps): number {
  const sizes = [height, width].filter(isUsableSize);
  return sizes.length > 0 ? Math.min(...sizes) : defaultRequestedSize;
}

/**
 * Returns the available size nearest to the requested size. A tie goes to the larger size. `sizes` must not be empty.
 */
export function pickNearestSize(sizes: readonly number[], requested: number): number {
  let nearest = sizes[0];
  for (const size of sizes) {
    const distance = Math.abs(size - requested);
    const nearestDistance = Math.abs(nearest - requested);
    if (distance < nearestDistance || (distance === nearestDistance && size > nearest)) {
      nearest = size;
    }
  }
  return nearest;
}

/**
 * Combines the optical sizes of one Fluent icon into a single icon source. Fluent icons are drawn per size, so each render
 * picks the glyph nearest to the smaller of the requested width and height. The chosen glyph is still drawn at the requested
 * width and height, which only rescale it through its viewBox.
 *
 * @param glyphs - glyph components keyed by their optical size, such as `{ 16: Dismiss16Regular, 20: Dismiss20Regular }`
 * @param displayName - name shown in the React tree
 */
export function createSizedIconSource(glyphs: Readonly<Record<number, SvgIconSource>>, displayName = 'SizedIcon'): SvgIconSource {
  const sizes = Object.keys(glyphs)
    .map(Number)
    .sort((a, b) => a - b);
  if (sizes.length === 0) {
    throw new Error(`${displayName} needs at least one glyph.`);
  }

  function SizedIcon(props: IconElementProps) {
    const Glyph = glyphs[pickNearestSize(sizes, getRequestedSize(props))];
    return <Glyph {...props} />;
  }
  SizedIcon.displayName = displayName;
  return SizedIcon;
}
