/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { View } from 'react-native';

import type { Icon } from '../../primitives/icon/icon';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { ListboxItemProps } from './listbox-item.types';

const iconSlot: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x2713, fontFamily: 'Arial' } };
const avatarSlot: SlotProp<typeof View> = { style: { backgroundColor: 'red' } };

const SvgIcon = (_props: IconElementProps) => null;
const replacementIconSlot: SlotProp<typeof Icon> = { as: SvgIcon, height: 20, width: 20 };

// @ts-expect-error ListboxItem does not expose children
const invalidChildren: ListboxItemProps = { children: 'invalid' };

describe('ListboxItem types', () => {
  it('accepts slot props for the public icon and avatar surfaces', () => {
    expect(iconSlot).toBeDefined();
    expect(avatarSlot).toBeDefined();
    expect(replacementIconSlot).toBeDefined();
  });
});
