import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { RadioGroup } from './radio-group';

const fast = { value: 'fast', label: 'Fast' };
const slow = { value: 'slow', label: 'Slow' };
const disabled = { value: 'pickup', label: 'Pickup', disabled: true };

describe('RadioGroup', () => {
  it('does not silently select, and removal does not request another value', async () => {
    const change = jest.fn();
    const props = { label: 'Delivery', options: [slow, fast], onValueChange: change, required: true };
    const tree = await render(<RadioGroup {...props} />);
    expect(tree.getByRole('radiogroup', { name: 'Delivery' })).toBeOnTheScreen();
    const item = (name: string) => tree.getByRole('radio', { name });
    expect(item('Slow').props.accessibilityState.checked).toBe(false);
    await fireEvent.press(item('Fast'), { nativeEvent: {} });
    expect(change.mock.calls).toEqual([['fast']]);
    expect(item('Fast').props.accessibilityState.checked).toBe(true);
    expect(item('Slow').props.accessibilityState.checked).toBe(false);
    await tree.rerender(<RadioGroup {...props} options={[slow]} />);
    expect(item('Slow').props.accessibilityState.checked).toBe(false);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('one arrow skips a disabled member and requests without assuming controlled acceptance', async () => {
    const change = jest.fn();
    const tree = await render(<RadioGroup label="Delivery" value="slow" options={[slow, disabled, fast]} onValueChange={change} />);
    const first = tree.getByRole('radio', { name: 'Slow' });
    await fireEvent(first, 'keyDown', { nativeEvent: { key: 'ArrowDown' } });
    expect(change.mock.calls).toEqual([['fast']]);
    expect(first.props.accessibilityState.checked).toBe(true);
    expect(tree.getByRole('radio', { name: 'Fast' }).props.accessibilityState.checked).toBe(false);
    expect(tree.getByRole('radio', { name: 'Pickup' })).toBeDisabled();
  });
});
