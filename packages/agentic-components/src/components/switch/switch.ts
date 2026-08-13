import type { SwitchProps } from './switch.types';
import { renderSwitch_unstable } from './renderSwitch';
import { useApplyStyles_unstable } from './useApplyStyles';
import { useSwitch_unstable } from './useSwitch';

export const Switch = (props: SwitchProps) => {
  const state = useSwitch_unstable(props);
  useApplyStyles_unstable(state);
  return renderSwitch_unstable(state);
};

Switch.displayName = 'Switch';

export default Switch;
