import { getNumericStyleValue } from './numericStyleValue';

/**
 * Narrows a validated numeric style value to a `number`, applying `Number` to the
 * result of `getNumericStyleValue` so numeric strings coerce the same way numbers pass through.
 */
export function getNumericStyleValueAsNumber(value: unknown): number {
  return Number(getNumericStyleValue(value));
}
