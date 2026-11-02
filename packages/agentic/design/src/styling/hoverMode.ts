import type { HoverMode, HoverTraits } from './traits.types';

/** Resolves the hover paint mode for an appearance, falling back to the base mode. */
export function resolveHoverMode<Variant extends string>(hover: HoverTraits<Variant>, appearance?: Variant): HoverMode {
  return (appearance !== undefined && hover.byAppearance?.[appearance]) || hover.base;
}
