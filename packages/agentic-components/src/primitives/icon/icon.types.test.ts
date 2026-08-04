/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Icon } from './icon';
import type { IconElementProps } from './icon.types';

const ImageIconSlot: SlotProp<typeof Icon> = {
  color: 'red',
  height: 16,
  imageSource: { uri: 'icon.png' },
  width: 16,
};

const FontIconSlot: SlotProp<typeof Icon> = {
  fontSource: { codepoint: 0xe001, fontFamily: 'IconFont' },
  height: 20,
  width: 20,
};

const SvgIcon = (_props: IconElementProps) => null;
const SvgIconSlot: SlotProp<typeof Icon> = { svgSource: SvgIcon };
const ReplacementIconSlot: SlotProp<typeof Icon> = { as: SvgIcon, color: 'blue', height: 12, width: 12 };

// @ts-expect-error Icon props accept only one source.
const ConflictingIconSlot: SlotProp<typeof Icon> = { imageSource: { uri: 'icon.png' }, svgSource: SvgIcon };

describe('Icon slot types', () => {
  it('accepts each source and component replacement', () => {
    expect(ImageIconSlot).toBeDefined();
    expect(FontIconSlot).toBeDefined();
    expect(SvgIconSlot).toBeDefined();
    expect(ReplacementIconSlot).toBeDefined();
  });
});
