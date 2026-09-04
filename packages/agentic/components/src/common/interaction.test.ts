import { disableNativeFocusRingProps, resolveFocusable } from './interaction';

describe('interaction helpers', () => {
  it('keeps disabled controls out of the focus order', () => {
    expect(resolveFocusable(true, true)).toBe(false);
    expect(resolveFocusable(undefined, true)).toBe(false);
  });

  it('respects explicit focusability for enabled controls', () => {
    expect(resolveFocusable(false, false)).toBe(false);
    expect(resolveFocusable(true, false)).toBe(true);
    expect(resolveFocusable(undefined, false)).toBe(true);
  });

  it('disables the native focus ring', () => {
    expect(disableNativeFocusRingProps).toEqual({ enableFocusRing: false });
  });
});
