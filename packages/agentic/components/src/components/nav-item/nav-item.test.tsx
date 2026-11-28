import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { NavItem } from './nav-item';

describe('NavItem', () => {
  it('never promotes carried-current presentation into selection and keeps the secondary action separate', async () => {
    const onExpandedChange = jest.fn();
    const secondary = jest.fn();
    const tree = await render(
      <NavItem
        type="category"
        value="projects"
        label="Projects"
        expanded={false}
        carriedCurrent
        onExpandedChange={onExpandedChange}
        secondaryActions={[{ key: 'pin', label: 'Pin Projects', testID: 'pin-projects', onPress: secondary }]}
      />,
    );
    const category = tree.getByRole('button', { name: 'Projects' });
    expect(category.props.accessibilityState).toMatchObject({ expanded: false });
    expect(category.props.accessibilityState.selected).toBeUndefined();
    expect(category.props.accessibilityValue?.text).toBeUndefined();
    const pin = tree.getByRole('button', { name: 'Pin Projects' });
    expect(pin).toBe(tree.getByTestId('pin-projects'));
    await fireEvent(pin, 'accessibilityTap');
    expect(secondary).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).not.toHaveBeenCalled();
    await fireEvent(category, 'accessibilityTap');
    expect(onExpandedChange.mock.calls).toEqual([[true]]);
    expect(category.props.accessibilityState.expanded).toBe(false);
  });

  it('does not navigate on focus or Space and sends the stable key on activation', async () => {
    const navigate = jest.fn();
    const tree = await render(
      <NavItem
        value="files"
        label="Project files"
        nesting="subitem"
        current
        currentDescription="Current page"
        badge={{ layout: 'counter', count: 3, accessibilityLabel: 'Three unread' }}
        onNavigate={navigate}
      />,
    );
    const link = tree.getByRole('link', { name: 'Project files' });
    expect(link.props.accessibilityValue).toMatchObject({ text: 'Current page' });
    expect(link.props.accessibilityHint).toBe('Three unread');
    await fireEvent(link, 'focus', { nativeEvent: {} });
    await fireEvent.press(link, { nativeEvent: { key: ' ' } });
    expect(navigate).not.toHaveBeenCalled();
    await fireEvent(link, 'accessibilityTap');
    expect(navigate.mock.calls).toEqual([['files']]);
  });
});
