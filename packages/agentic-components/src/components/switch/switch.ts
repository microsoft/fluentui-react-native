import type { SwitchProps } from './switch.types';
import { renderSwitch_unstable } from './renderSwitch';
import { useSwitchStyles_unstable } from './useSwitchStyles';
import { useSwitch_unstable } from './useSwitch';

export const Switch = (props: SwitchProps) => {
  const state = useSwitch_unstable(props);
  useSwitchStyles_unstable(state);
  return renderSwitch_unstable(state);
};

Switch.displayName = 'Switch';

export default Switch;
