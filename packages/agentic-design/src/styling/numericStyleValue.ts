/**
 * Accepts finite numeric style values and numeric strings.
 */
export function getNumericStyleValue(value: unknown): number | string {
  if (typeof value === 'number') {
    if (Number.isFinite(value)) {
      return value;
    }
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      const normalized = Number(trimmed);
      if (Number.isFinite(normalized) && /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(trimmed)) {
        return trimmed;
      }
    }
  }

  throw new TypeError('Style values must be finite numbers or numeric strings.');
}
