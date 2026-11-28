import { renderSwatch_unstable } from './renderSwatch';
import type { SwatchProps } from './swatch.types';
import { useSwatch_unstable } from './useSwatch';
import { useSwatchStyles_unstable } from './useSwatchStyles';

export function Swatch(props: SwatchProps) {
  const state = useSwatch_unstable(props);
  useSwatchStyles_unstable(state);
  return renderSwatch_unstable(state);
}
Swatch.displayName = 'Swatch';
