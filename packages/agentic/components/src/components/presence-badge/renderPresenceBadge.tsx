/** @jsxImportSource @fluentui-react-native/framework-base */
import type { PresenceBadgeState } from './presence-badge.types';

export function renderPresenceBadge_unstable(state: PresenceBadgeState) {
  return (
    <state.root>
      <state.mark />
    </state.root>
  );
}
