import type { InfoLabelProps } from './info-label.types';
import { renderInfoLabel_unstable } from './renderInfoLabel';
import { useInfoLabel_unstable } from './useInfoLabel';
import { useInfoLabelStyles_unstable } from './useInfoLabelStyles';

export const InfoLabel = (props: InfoLabelProps) => {
  const state = useInfoLabel_unstable(props);
  useInfoLabelStyles_unstable(state);
  return renderInfoLabel_unstable(state);
};
InfoLabel.displayName = 'InfoLabel';
