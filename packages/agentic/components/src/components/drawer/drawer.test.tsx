import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Drawer } from './drawer';

describe('Drawer', () => {
  it('asks the owner to restore focus after the same update accepts a controlled close', async () => {
    const changed = jest.fn();
    const restore = jest.fn();
    function Inspector() {
      const [open, setOpen] = useState(true);
      return (
        <Drawer
          title="Inspector"
          closeLabel="Close inspector"
          onCloseFocus={restore}
          open={open}
          onOpenChange={(next, data) => {
            changed(next, data);
            setOpen(next);
          }}
        >
          <Text>Options</Text>
        </Drawer>
      );
    }
    const tree = await render(<Inspector />);
    await fireEvent.press(tree.getByRole('button', { name: 'Close inspector' }));
    expect(changed).toHaveBeenLastCalledWith(false, { reason: 'close' });
    expect(restore).toHaveBeenCalledTimes(1);
    expect(tree.queryByText('Options', { includeHiddenElements: true })).toBeNull();
  });

  it('does not restore focus after a rejected close followed by an unrelated update', async () => {
    const restore = jest.fn();
    const props = { title: 'Inspector', closeLabel: 'Close inspector', onCloseFocus: restore, testID: 'drawer' };
    const tree = await render(<Drawer {...props} open />);
    expect(tree.getByTestId('drawer').props).toMatchObject({ role: 'group', accessibilityLabel: 'Inspector' });
    await fireEvent.press(tree.getByRole('button', { name: 'Close inspector' }));
    await tree.rerender(<Drawer {...props} open={false} />);
    expect(restore).not.toHaveBeenCalled();
  });

  it('uses the owner’s extent on the correct axis', async () => {
    const tree = await render(
      <Drawer title="Inspector" defaultOpen position="bottom" size="custom" customSize={210} availableExtent={160} testID="drawer" />,
    );
    expect(StyleSheet.flatten(tree.getByTestId('drawer').props.style)).toMatchObject({ height: 210, maxHeight: 160 });
    await tree.rerender(<Drawer title="Inspector" defaultOpen size="small" position="end" availableExtent={160} testID="drawer" />);
    expect(StyleSheet.flatten(tree.getByTestId('drawer').props.style)).toMatchObject({ width: 320, maxWidth: 160 });
  });
});
