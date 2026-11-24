import { act, fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('keeps newlines and forwards accepted edits only from the actual editor', async () => {
    const changed = jest.fn();
    const tree = await render(<Textarea accessibilityLabel="Comment" defaultValue="One" onChangeText={changed} />);
    const editor = () => tree.getByRole('textbox', { name: 'Comment' });
    expect(editor().props).toMatchObject({ multiline: true, submitBehavior: 'newline', value: 'One' });
    await fireEvent.changeText(editor(), 'One\nTwo');
    expect(changed).toHaveBeenLastCalledWith('One\nTwo');
    expect(editor().props.value).toBe('One\nTwo');
    await tree.rerender(<Textarea accessibilityLabel="Comment" value="" readOnly onChangeText={changed} />);
    expect(editor().props).toMatchObject({ editable: false, focusable: true, value: '' });
    await act(async () => editor().props.onChangeText('Blocked'));
    expect(changed).toHaveBeenCalledTimes(1);
    await tree.rerender(<Textarea accessibilityLabel="Comment" value="New" disabled onChangeText={changed} />);
    expect(editor().props).toMatchObject({ editable: false, focusable: false, value: 'New' });
    await act(async () => editor().props.onChangeText('Blocked'));
    expect(changed).toHaveBeenCalledTimes(1);
  });
});
