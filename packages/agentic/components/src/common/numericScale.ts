export function createNumericScale(minimum: number, maximum: number, step: number) {
  const span = maximum - minimum;
  if (
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum) ||
    !Number.isFinite(span) ||
    span <= 0 ||
    !Number.isFinite(step) ||
    step <= 0 ||
    !Number.isFinite(span / step)
  ) {
    throw new TypeError('Expected finite ordered bounds and a positive finite step.');
  }
  const clamp = (value: number) => Math.min(maximum, Math.max(minimum, value));
  const resolve = (value: number) => {
    if (!Number.isFinite(value) || value <= minimum) return minimum;
    if (value >= maximum) return maximum;
    const result = minimum + Math.round((value - minimum) / step) * step;
    return clamp(Number(result.toPrecision(15)));
  };
  return {
    minimum,
    maximum,
    step,
    resolve,
    fraction: (value: number) => (clamp(value) - minimum) / span,
    at: (fraction: number) => resolve(minimum + Math.min(1, Math.max(0, fraction)) * span),
  };
}

export type NumericScale = ReturnType<typeof createNumericScale>;
