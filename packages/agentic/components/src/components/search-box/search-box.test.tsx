import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { SearchBox } from './search-box';

const labels = { accessibilityLabel: 'Search projects', clearLabel: 'Clear search' };

describe('SearchBox', () => {
  it('renders the leading search glyph without exposing another accessible target', async () => {
    const tree = await render(<SearchBox {...labels} />);
    const stack = tree.getByTestId('input-icon-text-stack', { includeHiddenElements: true });
    expect(stack.children).toHaveLength(2);
    expect(tree.getByRole('textbox', { name: 'Search projects' })).toBeOnTheScreen();
    expect(tree.queryByRole('image')).toBeNull();
  });

  it('makes clear an independent request that a controlled owner can reject', async () => {
    const onChangeText = jest.fn();
    const onSubmitQuery = jest.fn();
    const props = { ...labels, onChangeText, onSubmitQuery };
    const tree = await render(<SearchBox {...props} value="budget" />);
    await fireEvent(tree.getByRole('button', { name: 'Clear search' }), 'accessibilityTap');
    expect(onChangeText.mock.calls).toEqual([['']]);
    expect(onSubmitQuery).not.toHaveBeenCalled();
    expect(tree.getByRole('textbox', { name: 'Search projects' })).toHaveDisplayValue('budget');
    await tree.rerender(<SearchBox {...props} value="" defaultValue="not the controlled value" />);
    expect(tree.queryByRole('button', { name: 'Clear search' })).toBeNull();
    expect(tree.getByRole('textbox', { name: 'Search projects' })).toHaveDisplayValue('');
  });

  it('leaves modified and empty Escape alone without turning clear into a submission', async () => {
    const onChangeText = jest.fn();
    const onSubmitQuery = jest.fn();
    const tree = await render(<SearchBox {...labels} onChangeText={onChangeText} onSubmitQuery={onSubmitQuery} defaultValue="budget" />);
    const editor = tree.getByRole('textbox', { name: 'Search projects' });
    const preventDefault = jest.fn();
    await fireEvent(editor, 'keyDown', { nativeEvent: { key: 'Escape', shiftKey: true }, preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(onChangeText).not.toHaveBeenCalled();
    await fireEvent(editor, 'submitEditing', { nativeEvent: { text: 'budget' } });
    expect(onSubmitQuery.mock.calls).toEqual([['budget']]);
    await fireEvent(editor, 'keyDown', { nativeEvent: { key: 'Escape' }, preventDefault });
    expect(onChangeText.mock.calls).toEqual([['']]);
    await fireEvent(editor, 'keyDown', { nativeEvent: { key: 'Escape' }, preventDefault });
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledTimes(1);
  });

  it('disables the named clear target with the edit control', async () => {
    const onChangeText = jest.fn();
    const tree = await render(<SearchBox {...labels} defaultValue="budget" disabled onChangeText={onChangeText} />);
    const clear = tree.getByRole('button', { name: 'Clear search' });
    expect(clear).toBeDisabled();
    expect(clear.props.focusable).toBe(false);
    clear.props.onAccessibilityTap?.();
    expect(onChangeText).not.toHaveBeenCalled();
  });
});
