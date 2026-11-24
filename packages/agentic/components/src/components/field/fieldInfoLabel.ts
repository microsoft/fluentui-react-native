import type { InfoLabelProps } from '../info-label/info-label.types';
import { renderInfoLabel_unstable } from '../info-label/renderInfoLabel';
import { useInfoLabel } from '../info-label/useInfoLabel';
import { useInfoLabelStyles_unstable } from '../info-label/useInfoLabelStyles';

export function FieldInfoLabel(props: InfoLabelProps) {
  const state = useInfoLabel(props);
  useInfoLabelStyles_unstable(state);
  return renderInfoLabel_unstable(state);
}
