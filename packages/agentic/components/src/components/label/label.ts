import { directComponent, phasedComponent } from '@fluentui-react-native/framework-base';

import type { LabelProps } from './label.types';
import { renderLabel_unstable } from './renderLabel';
import { useLabelStyles_unstable } from './useLabelStyles';
import { useLabel_unstable } from './useLabel';

/**
 * Label names an associated form control. It is non-interactive and mirrors only the disabled affordance of that
 * control.
 */
export const Label = phasedComponent<LabelProps>((props) => {
  const state = useLabel_unstable(props);

  useLabelStyles_unstable(state);

  return directComponent<LabelProps>(() => renderLabel_unstable(state));
});

Label.displayName = 'Label';

export default Label;
