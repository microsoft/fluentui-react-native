import type { LabelProps } from './label.types';
import { renderLabel_unstable } from './renderLabel';
import { useLabel_unstable } from './useLabel';
import { useLabelStyles_unstable } from './useLabelStyles';

export function Label(props: LabelProps) {
  const state = useLabel_unstable(props);
  useLabelStyles_unstable(state);
  return renderLabel_unstable(state);
}
Label.displayName = 'Label';
