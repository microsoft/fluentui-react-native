import type { ButtonState } from './button.types';

/**
 * Render the Button component
 * @param State The state of the Button component containing slots and other state information.
 * @returns The rendered Button component.
 */
export function renderButton_unstable(State: ButtonState) {
  const { iconOnly, iconPosition } = State;
  return (
    <State.root>
      {iconPosition !== 'after' && State.icon && <State.icon />}
      {!iconOnly && State.content && <State.content />}
      {iconPosition === 'after' && State.icon && <State.icon />}
    </State.root>
  );
}
