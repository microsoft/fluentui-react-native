/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import { Avatar } from './avatar';
import type { AvatarProps } from './avatar.types';

const ImageAvatarProps: AvatarProps = {
  accessibilityLabel: 'Lydia Mitchelson',
  image: { source: { uri: 'avatar.png' } },
  size: 56,
};

const IconAvatarProps: AvatarProps = {
  accessibilityLabel: 'Contoso bot',
  icon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } },
};

const InitialsAvatarProps: AvatarProps = {
  accessibilityLabel: 'Lydia Mitchelson',
  initials: 'LM',
};

const AvatarSlot: SlotProp<typeof Avatar> = {
  accessibilityLabel: 'Lydia Mitchelson',
  initials: 'LM',
};

describe('Avatar types', () => {
  it('accepts the supported public slot and prop combinations', () => {
    expect(ImageAvatarProps).toBeDefined();
    expect(IconAvatarProps).toBeDefined();
    expect(InitialsAvatarProps).toBeDefined();
    expect(AvatarSlot).toBeDefined();
  });
});
