/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { FocusVisual } from './focus-visual';

const SingleRingFocusVisual: SlotProp<typeof FocusVisual> = {
  style: { borderColor: 'black', borderWidth: 2 },
  visible: true,
};

const DualRingFocusVisual: SlotProp<typeof FocusVisual> = {
  inner: { style: { borderColor: 'white', borderWidth: 1 } },
  style: { borderColor: 'black', borderWidth: 2 },
  visible: false,
};

// @ts-expect-error FocusVisual owns its children.
const FocusVisualWithChildren: SlotProp<typeof FocusVisual> = { children: 'ring' };

describe('FocusVisual slot types', () => {
  it('accepts single and dual ring props', () => {
    expect(SingleRingFocusVisual).toBeDefined();
    expect(DualRingFocusVisual).toBeDefined();
  });
});
