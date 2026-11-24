import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Button } from '../button/button';
import { Divider } from '../divider/divider';
import { ToggleButton } from '../toggle-button/toggle-button';
import { Toolbar } from './toolbar';

describe('Toolbar', () => {
  it('keeps keyed commands in both sibling arrays', async () => {
    const buttons = ['Link', 'Image'].map((content, index) => <Button key={index} content={content} />);
    const toggles = ['Bold', 'Italic'].map((content, index) => <ToggleButton key={index} content={content} />);
    const tree = await render(
      <Toolbar accessibilityLabel="Formatting">
        {buttons}
        <Divider />
        {toggles}
      </Toolbar>,
    );
    expect(tree.getByRole('button', { name: 'Link' })).toBeOnTheScreen();
    expect(tree.getByRole('button', { name: 'Bold' })).toBeOnTheScreen();
    expect(tree.getAllByRole('button')).toHaveLength(4);
  });

  it('skips disabled targets without issuing any command, and leaves toggling with the child', async () => {
    const onPress = jest.fn();
    const onSelectedChange = jest.fn();
    const tree = await render(
      <Toolbar accessibilityLabel="Formatting">
        <Button key="insert" content="Insert" onPress={onPress} />
        <Divider />
        <Button key="paste" content="Paste" disabled />
        <ToggleButton key="bold" content="Bold" onSelectedChange={onSelectedChange} />
      </Toolbar>,
    );
    const insert = tree.getByRole('button', { name: 'Insert' });
    const bold = tree.getByRole('button', { name: 'Bold' });
    expect(tree.getByRole('toolbar', { name: 'Formatting' })).toBeOnTheScreen();
    expect(insert.props.focusable).toBe(true);
    expect(bold.props.focusable).toBe(false);
    const cancel = jest.fn();
    await fireEvent(insert, 'keyDown', { nativeEvent: { key: 'ArrowRight' }, preventDefault: cancel });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(tree.queryByRole('separator')).toBeNull();
    await fireEvent.press(bold, { nativeEvent: {} });
    expect(onSelectedChange.mock.calls).toEqual([[true]]);
  });
});
