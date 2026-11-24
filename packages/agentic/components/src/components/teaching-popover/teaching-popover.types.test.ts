import type { TeachingPopoverProps } from '../../index';

describe('TeachingPopover props', () => {
  it('requires an anchored trigger and a label for its actions', () => {
    const tour: TeachingPopoverProps = { trigger: { content: 'Show tips' }, title: 'Tip' };
    // @ts-expect-error An anchor is required.
    const detached: TeachingPopoverProps = { title: 'Tip' };
    // @ts-expect-error A lesson action must have a localized label.
    const unnamed: TeachingPopoverProps = { ...tour, primaryAction: { onPress: () => {} } };
    expect([tour, detached, unnamed]).toHaveLength(3);
  });
});
