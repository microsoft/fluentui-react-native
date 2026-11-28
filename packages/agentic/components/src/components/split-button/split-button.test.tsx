import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { MenuItem } from '../menu-item/menu-item';
import { SplitButton } from './split-button';

describe('SplitButton', () => {
  it('only sends menu changes from the secondary part and only sends commands from the primary part', async () => {
    const onPress = jest.fn();
    const onOpenChange = jest.fn();
    const tree = await render(
      <SplitButton content="Export" menuLabel="Other formats" onPress={onPress} onOpenChange={onOpenChange} open={false}>
        <MenuItem content="Export PDF" />
      </SplitButton>,
    );
    const primary = tree.getByRole('button', { name: 'Export' });
    const menu = tree.getByRole('button', { name: 'Other formats' });
    expect(primary.props.accessibilityState.expanded).toBeUndefined();
    expect(menu.props.accessibilityState.expanded).toBe(false);
    await fireEvent.press(primary);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    await fireEvent(menu, 'accessibilityTap');
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
