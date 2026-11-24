import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Text } from '../text/text';
import { Dialog } from './dialog';

describe('Dialog', () => {
  it('latches a native close even if the controlled owner still requests true', async () => {
    const change = jest.fn();
    const props = { title: 'Review', onOpenChange: change, windowTestID: 'dialog-host' };
    const tree = await render(
      <Dialog {...props} open>
        <Text>Details</Text>
      </Dialog>,
    );
    const host = () => tree.getByTestId('dialog-host');
    expect(host().props.shown).toBe(true);
    await fireEvent(host(), 'windowEvent', { nativeEvent: { kind: 'native-close' } });
    expect(change.mock.calls).toEqual([[false, { reason: 'native-close' }]]);
    expect(host().props.shown).toBe(false);
    await tree.rerender(<Dialog {...props} title="Updated review" open />);
    expect(host().props.shown).toBe(false);
    await tree.rerender(<Dialog {...props} open={false} />);
    await tree.rerender(<Dialog {...props} open />);
    expect(host().props.shown).toBe(true);
  });

  it('refuses alert dismissal but resolves through an explicit action', async () => {
    const change = jest.fn();
    const onPress = jest.fn();
    const tree = await render(
      <Dialog
        windowTestID="dialog-host"
        title="Confirm"
        type="alert"
        defaultOpen
        closeLabel="Close"
        onOpenChange={change}
        actions={[{ key: 'accept', label: 'Accept', onPress }]}
      />,
    );
    expect(tree.queryByRole('button', { name: 'Close' })).toBeNull();
    await fireEvent(tree.getByTestId('dialog-host'), 'windowEvent', { nativeEvent: { kind: 'dismiss-request' } });
    expect(change).not.toHaveBeenCalled();
    await fireEvent.press(tree.getByRole('button', { name: 'Accept' }));
    expect(change.mock.calls).toEqual([[false, { reason: 'resolve' }]]);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
