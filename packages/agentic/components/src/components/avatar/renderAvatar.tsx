/** @jsxImportSource @fluentui-react-native/framework-base */
import type { AvatarState } from './avatar.types';

export function renderAvatar_unstable(state: AvatarState) {
  const { contentMode, icon: Icon, image: Image, initials: Initials } = state;

  return (
    <state.root>
      {contentMode === 'image' && Image && <Image />}
      {contentMode === 'icon' && Icon && <Icon />}
      {contentMode === 'initials' && Initials && <Initials />}
    </state.root>
  );
}
