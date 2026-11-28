import type { LayoutRectangle } from 'react-native';
import type { SwatchPickerItem } from './swatch-picker.types';

export function adjacentSwatchRow(
  options: readonly SwatchPickerItem[],
  geometry: ReadonlyMap<string, LayoutRectangle>,
  value: string,
  direction: 'up' | 'down',
): string | undefined {
  const source = geometry.get(value);
  if (!source) return undefined;
  const center = source.x + source.width / 2;
  const sign = direction === 'up' ? -1 : 1;
  let best: { value: string; rowDistance: number; columnDistance: number } | undefined;
  for (const option of options) {
    if (option.disabled) continue;
    const rect = geometry.get(option.value);
    if (!rect) continue;
    const rowDistance = (rect.y - source.y) * sign;
    if (rowDistance <= 0) continue;
    const columnDistance = Math.abs(rect.x + rect.width / 2 - center);
    if (!best || rowDistance < best.rowDistance || (rowDistance === best.rowDistance && columnDistance < best.columnDistance)) {
      best = { value: option.value, rowDistance, columnDistance };
    }
  }
  return best?.value;
}
