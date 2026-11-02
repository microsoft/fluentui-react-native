import { fireEvent } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';

import type { ChannelMode } from '@fluentui-react-native/design/styling';

export type InteractionReadout<T> = {
  readonly rest: T;
  readonly hovered: T;
  readonly pressed: T;
};

/**
 * Test helper: reads a value at rest, while hovered, and while pressed by firing hover and press events on a pressable
 * target, then releases both. Write behavior expectations for the readout independently of the traits constant.
 */
export async function readInteractionStates<T>(target: TestInstance, read: () => T): Promise<InteractionReadout<T>> {
  const rest = read();
  await fireEvent(target, 'hoverIn', {});
  const hovered = read();
  await fireEvent(target, 'pressIn', {});
  const pressed = read();
  await fireEvent(target, 'pressOut', {});
  await fireEvent(target, 'hoverOut', {});
  return { rest, hovered, pressed };
}

/**
 * Conformance helper: checks that a channel readout follows the component's declared channel trait. A `rest` channel
 * keeps its rest value while hovered and pressed; an `interactive` channel changes in both states. Pick a readout whose
 * tokens have distinct interaction values; the rest value must be defined so an unpainted readout cannot pass.
 */
export function expectChannelConformance<T>(readout: InteractionReadout<T>, mode: ChannelMode): void {
  if (mode === 'rest' || mode === 'interactive') {
    expect(readout.rest).toBeDefined();
  }
  if (mode === 'rest') {
    expect(readout.hovered).toEqual(readout.rest);
    expect(readout.pressed).toEqual(readout.rest);
  } else if (mode === 'interactive') {
    expect(readout.hovered).not.toEqual(readout.rest);
    expect(readout.pressed).not.toEqual(readout.rest);
  }
}
