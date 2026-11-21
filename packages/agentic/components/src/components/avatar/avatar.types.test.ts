/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Avatar } from './avatar';
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

// @ts-expect-error Image, initials, and icon cannot be combined.
const MixedAvatar: AvatarProps = { image: { source: { uri: 'avatar.png' } }, initials: 'LM' };

// @ts-expect-error Avatar is an identity marker, not a focus target.
const FocusableAvatar: AvatarProps = { focusable: true };

describe('Avatar types', () => {
  it('accepts the supported public slot and prop combinations', () => {
    expect(ImageAvatarProps).toBeDefined();
    expect(IconAvatarProps).toBeDefined();
    expect(InitialsAvatarProps).toBeDefined();
    expect(AvatarSlot).toBeDefined();
  });
});
