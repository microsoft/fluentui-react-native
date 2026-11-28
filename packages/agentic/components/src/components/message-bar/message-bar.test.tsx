import { AccessibilityInfo } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { MessageBar } from './message-bar';

describe('MessageBar', () => {
  it('keeps content and retry after the owner declines dismissal', async () => {
    const retry = jest.fn();
    const onDismiss = jest.fn();
    const tree = await render(
      <MessageBar
        announce={false}
        content="No connection"
        title="Sync failed"
        status="error"
        actions={[{ label: 'Retry', onPress: retry }]}
        onDismiss={onDismiss}
        dismissLabel="Dismiss warning"
      />,
    );
    const close = tree.getByRole('button', { name: 'Dismiss warning' });
    await fireEvent.press(close);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(retry).not.toHaveBeenCalled();
    expect(tree.getByRole('text', { name: 'Sync failed. No connection' })).toBeOnTheScreen();
    await fireEvent.press(tree.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('requests one announcement for changed meaning, not each render', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {});
    try {
      const tree = await render(<MessageBar content="Sync started" />);
      await tree.rerender(<MessageBar content="Sync started" />);
      await tree.rerender(<MessageBar content="Sync started" announce={false} />);
      await tree.rerender(<MessageBar content="Sync started" />);
      expect(announce).toHaveBeenCalledTimes(1);
      await tree.rerender(<MessageBar content="Sync started" announcementKey="retry" />);
      await tree.rerender(<MessageBar content="No connection" status="error" />);
      await tree.rerender(<MessageBar content="" status="error" />);
      await tree.rerender(<MessageBar content="No connection" status="error" />);
      expect(announce.mock.calls).toEqual([
        ['Sync started', { queue: true }],
        ['Sync started', { queue: true }],
        ['No connection', { queue: false }],
        ['No connection', { queue: false }],
      ]);
    } finally {
      announce.mockRestore();
    }
  });
});
