import { applyFocusRingStyles, useFocusVisuals } from '../index';
import type { ButtonSlots, ButtonState, FocusVisualsOptions, FocusVisualsState } from '../index';

const options: FocusVisualsOptions = { focused: true, useSystemFocusRing: false, alwaysVisible: true };

function acceptsResolvedSlot(state: ButtonState, visuals: FocusVisualsState) {
  state.FocusRing = visuals.FocusRing;
  applyFocusRingStyles(state.FocusRing, state, 4);
}

// @ts-expect-error Focused state must be a boolean.
const invalidOptions: FocusVisualsOptions = { focused: 'true' };
// @ts-expect-error FocusRing is private state, not a public component slot.
const invalidSlot: keyof ButtonSlots = 'FocusRing';

describe('focus visual types', () => {
  it('exports the hook and styling companion with private resolved slots', () => {
    expect(useFocusVisuals).toEqual(expect.any(Function));
    expect(applyFocusRingStyles).toEqual(expect.any(Function));
    expect(acceptsResolvedSlot).toEqual(expect.any(Function));
    expect(options.focused).toBe(true);
    expect(invalidOptions.focused).toBe('true');
    expect(invalidSlot).toBe('FocusRing');
  });
});
