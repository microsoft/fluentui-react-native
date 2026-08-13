import type { RadioProps } from './radio.types';
import { useRadio_unstable } from './useRadio';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderRadio_unstable } from './renderRadio';

/**
 * A molecular single-select control for choosing exactly one option from a group of mutually exclusive choices.
 */
export const Radio = (props: RadioProps) => {
  const state = useRadio_unstable(props);
  useApplyStyles_unstable(state);
  return renderRadio_unstable(state);
};

Radio.displayName = 'Radio';

export default Radio;
