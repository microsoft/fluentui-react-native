/** @jsxImportSource @fluentui-react-native/framework-base */
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import type { AvatarState } from './avatar.types';

export function renderAvatar_unstable(state: AvatarState) {
  const { contentMode, icon: Icon, image: Image, initials: Initials } = state;

  return (
    <state.root>
      <FocusVisual {...state.activityRingProps} />
      {contentMode === 'image' && Image && <Image />}
      {contentMode === 'icon' && Icon && <Icon />}
      {contentMode === 'initials' && Initials && <Initials />}
    </state.root>
  );
}
