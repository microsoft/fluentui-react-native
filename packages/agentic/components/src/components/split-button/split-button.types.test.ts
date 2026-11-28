import type { SplitButtonProps } from '../../index';

describe('SplitButton props', () => {
  it('requires an independent menu name', () => {
    const split: SplitButtonProps = { content: 'Export', menuLabel: 'Other formats', onPress: () => {}, children: null };
    // @ts-expect-error Subtle is not a SplitButton appearance.
    const subtle: SplitButtonProps = { ...split, appearance: 'subtle' };
    // @ts-expect-error Neither a chevron nor the primary command labels the menu trigger.
    const unnamed: SplitButtonProps = { content: 'Export', onPress: () => {}, children: null };
    expect([split, subtle, unnamed]).toHaveLength(3);
  });
});
