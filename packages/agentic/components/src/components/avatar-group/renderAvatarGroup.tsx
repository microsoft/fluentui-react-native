/** @jsxImportSource @fluentui-react-native/framework-base */
import { Avatar } from '../avatar/avatar';
import type { AvatarGroupState } from './avatar-group.types';

export function renderAvatarGroup_unstable(state: AvatarGroupState) {
  return (
    <state.root>
      {state.visibleMembers.map(({ key, avatar }) => (
        <Avatar key={key} {...avatar} />
      ))}
      {state.overflow && state.count && (
        <state.overflow>
          <state.count />
        </state.overflow>
      )}
    </state.root>
  );
}
