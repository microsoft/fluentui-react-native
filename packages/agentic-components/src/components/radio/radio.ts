import type { RadioProps } from './radio.types';
import { useRadio_unstable } from './useRadio';
import { useRadioStyles_unstable } from './useRadioStyles';
import { renderRadio_unstable } from './renderRadio';

/**
 * A molecular single-select control for choosing exactly one option from a group of mutually exclusive choices.
 */
export const Radio = (props: RadioProps) => {
  const state = useRadio_unstable(props);
  useRadioStyles_unstable(state);
  return renderRadio_unstable(state);
};

Radio.displayName = 'Radio';

export default Radio;
