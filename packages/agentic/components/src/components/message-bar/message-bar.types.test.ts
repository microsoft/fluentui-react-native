import type { MessageBarProps } from '../../index';

describe('MessageBar props', () => {
  it('requires a localized dismiss label for its owner callback', () => {
    const props: MessageBarProps = { content: 'No connection', dismissLabel: 'Dismiss', onDismiss: () => {} };
    // @ts-expect-error The dismissal label is not inferred from the message.
    const missing: MessageBarProps = { content: 'No connection', onDismiss: () => {} };
    expect([props, missing]).toHaveLength(2);
  });
});
