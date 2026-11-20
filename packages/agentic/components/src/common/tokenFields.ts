import type { ColorValue, DimensionValue } from 'react-native';

export function numericToken(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('expected a finite number');
  return value;
}

export function stringToken(value: unknown): string {
  if (typeof value !== 'string') throw new TypeError('expected a string');
  return value;
}

export function dimensionToken(value: unknown): DimensionValue {
  if (typeof value === 'string') {
    if (value === 'auto' || (value.endsWith('%') && value.length > 1 && Number.isFinite(Number(value.slice(0, -1))))) {
      return value as 'auto' | `${number}%`;
    }
  }
  return numericToken(value);
}

export function colorToken(value: unknown): ColorValue {
  if (typeof value === 'string' || (typeof value === 'object' && value !== null && !Array.isArray(value))) return value as ColorValue;
  throw new TypeError('expected a React Native color');
}

export function enumToken<const T extends readonly (string | number)[]>(...values: T) {
  return (value: unknown): T[number] => {
    if ((typeof value === 'string' || typeof value === 'number') && values.includes(value)) return value;
    throw new TypeError(`expected ${values.join(', ')}`);
  };
}

export const iconTokenProps = { color: colorToken, width: numericToken, height: numericToken };
