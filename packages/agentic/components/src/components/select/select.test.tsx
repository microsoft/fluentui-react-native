import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Select } from './select';

const options = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red', disabled: true },
];

describe('Select', () => {
  it('only requests enabled valid choices and keeps controlled clear distinct from a native choice', async () => {
    const change = jest.fn();
    const props = { options, accessibilityLabel: 'Color', placeholder: 'Choose a color', onValueChange: change, pickerTestID: 'picker' };
    const tree = await render(<Select {...props} value={null} />);
    const picker = () => tree.getByTestId('picker');
    expect(picker().props.selectedKey).toBeUndefined();
    expect(picker().props.options).toHaveLength(3);
    await fireEvent(picker(), 'selectionRequest', { nativeEvent: { key: 'red' } });
    await fireEvent(picker(), 'selectionRequest', { nativeEvent: { key: 'absent' } });
    await fireEvent(picker(), 'selectionRequest', { nativeEvent: { key: 'blue' } });
    expect(change.mock.calls).toEqual([['blue']]);
    expect(picker().props.selectedKey).toBeUndefined();
    await tree.rerender(<Select {...props} value="green" />);
    expect(picker().props.selectedKey).toBe('green');
    expect(change).toHaveBeenCalledTimes(1);
  });
});
