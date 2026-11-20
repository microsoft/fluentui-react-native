import { semanticIconSources } from '../../common/iconSources';
import type { FontIconSource, SvgIconSource } from '../../primitives/icon/icon.types';

export type ChevronSource = { fontSource: FontIconSource; svgSource?: never } | { svgSource: SvgIconSource; fontSource?: never };

const fallback = (): ChevronSource => ({ fontSource: semanticIconSources.chevronDown });

export const fallbackChevronAssets = {
  ChevronDown16Regular: fallback,
  ChevronDown20Regular: fallback,
};

export function parseChevronSource(value: unknown): ChevronSource {
  if (typeof value !== 'object' || value === null) throw new TypeError('Expected a chevron source');
  if ('svgSource' in value && typeof value.svgSource === 'function' && !('fontSource' in value)) {
    return { svgSource: value.svgSource as SvgIconSource };
  }
  if ('fontSource' in value && !('svgSource' in value)) {
    const source = value.fontSource;
    if (source && typeof source === 'object' && 'codepoint' in source && typeof source.codepoint === 'number') {
      return { fontSource: source as FontIconSource };
    }
  }
  throw new TypeError('Expected exactly one font or SVG chevron source');
}
