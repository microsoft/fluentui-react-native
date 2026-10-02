import { directComponent, phasedComponent } from '@fluentui-react-native/framework-base';

import type { LabelProps } from './label.types';
import { renderLabel_unstable } from './renderLabel';
import { useLabel_unstable } from './useLabel';
import { useLabelStyles_unstable } from './useLabelStyles';

export const Label = phasedComponent<LabelProps>((props) => {
  const state = useLabel_unstable(props);
  useLabelStyles_unstable(state);
  return directComponent<LabelProps>(() => renderLabel_unstable(state));
});

Label.displayName = 'Label';
