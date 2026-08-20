/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { LayoutStableText } from './layout-stable-text';

const LayoutStableTextSlot: SlotProp<typeof LayoutStableText> = {
  reserve: null as never,
  visible: null as never,
};

// @ts-expect-error LayoutStableText owns its children.
const LayoutStableTextWithChildren: SlotProp<typeof LayoutStableText> = { children: 'Label' };

describe('LayoutStableText slot types', () => {
  it('accepts its required text elements', () => {
    expect(LayoutStableTextSlot).toBeDefined();
  });
});
