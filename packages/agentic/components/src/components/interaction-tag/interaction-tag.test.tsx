import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { InteractionTag } from './interaction-tag';

describe('InteractionTag', () => {
  it('keeps command and remove independent and never removes itself', async () => {
    const onPress = jest.fn();
    const onDismiss = jest.fn();
    const tree = await render(<InteractionTag content="Lin" dismissLabel="Remove Lin" onPress={onPress} onDismiss={onDismiss} />);
    const primary = tree.getByRole('button', { name: 'Lin' });
    const remove = tree.getByRole('button', { name: 'Remove Lin' });
    expect(tree.getAllByRole('button')).toEqual([primary, remove]);
    await fireEvent.press(remove);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    await fireEvent(primary, 'accessibilityTap');
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(tree.getAllByRole('button')).toHaveLength(2);
    await tree.rerender(<InteractionTag content="Lin" dismissLabel="Remove Lin" disabled onPress={onPress} onDismiss={onDismiss} />);
    expect(tree.getAllByRole('button').every((button) => button.props.focusable === false)).toBe(true);
  });
});
