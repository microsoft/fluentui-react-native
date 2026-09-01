export function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function channelToByte(value: number): number {
  return Math.round(clamp(value) * 255);
}
