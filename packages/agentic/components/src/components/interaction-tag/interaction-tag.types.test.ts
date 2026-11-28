import type { InteractionTagProps } from '../../index';

describe('InteractionTag props', () => {
  it('requires an independent remove label and prevents conflicting media', () => {
    const tag: InteractionTagProps = { content: 'Lin', dismissLabel: 'Remove Lin', onPress: () => {}, onDismiss: () => {} };
    // @ts-expect-error Cannot supply both media slots.
    const both: InteractionTagProps = { ...tag, leadingIcon: { fontSource: { codepoint: 1 } }, avatar: { initials: 'L' } };
    // @ts-expect-error Removal is owner-requested with its own name.
    const unnamed: InteractionTagProps = { content: 'Lin', onPress: () => {}, onDismiss: () => {} };
    expect([tag, both, unnamed]).toHaveLength(3);
  });
});
