import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Nav } from './nav';
import type { NavEntry } from './nav.types';

const items: readonly NavEntry[] = [{ type: 'category', key: 'team', label: 'Team', children: [{ key: 'schedule', label: 'Schedule' }] }];
describe('Nav', () => {
  it('keeps expansion separate from externally owned routing', async () => {
    const navigate = jest.fn();
    const expand = jest.fn();
    const props = {
      items,
      accessibilityLabel: 'Workspace',
      currentValue: 'schedule',
      currentDescription: 'Current page',
      onNavigate: navigate,
      onExpandedChange: expand,
    };
    const tree = await render(<Nav {...props} />);
    const group = () => tree.getByRole('button', { name: 'Team' });
    expect(tree.queryByRole('link', { name: 'Schedule' })).toBeNull();
    await fireEvent(group(), 'accessibilityTap');
    expect(expand.mock.calls).toEqual([[['team'], { key: 'team' }]]);
    expect(navigate).not.toHaveBeenCalled();
    const link = tree.getByRole('link', { name: 'Schedule' });
    expect(link.props.accessibilityValue.text).toBe('Current page');
    await fireEvent(link, 'accessibilityTap');
    expect(navigate).toHaveBeenCalledWith('schedule');
    await fireEvent(group(), 'accessibilityTap');
    expect(tree.queryByRole('link', { name: 'Schedule' })).toBeNull();
    expect(group().props.accessibilityValue?.text).toBeUndefined();
  });
});
