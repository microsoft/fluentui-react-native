import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { SimpleNav } from './simple-nav';
import type { SimpleNavDestination } from './simple-nav.types';

const items: readonly SimpleNavDestination[] = [
  { key: 'files', label: 'Files', leading: { kind: 'icon', icon: { fontSource: { codepoint: 0x2302 } } } },
];
describe('SimpleNav', () => {
  it('preserves the live destination name through rail and hide without updating the route', async () => {
    const navigate = jest.fn();
    const props = {
      items,
      onNavigate: navigate,
      accessibilityLabel: 'Application',
      currentValue: 'files',
      currentDescription: 'Current page',
      breakpoints: { hideBelow: 40, railBelow: 120 },
    };
    const tree = await render(<SimpleNav {...props} availableWidth={200} />);
    await tree.rerender(<SimpleNav {...props} availableWidth={80} />);
    const link = tree.getByRole('link', { name: 'Files' });
    expect(link.props.accessibilityValue.text).toBe('Current page');
    await fireEvent(link, 'accessibilityTap');
    expect(navigate).toHaveBeenCalledWith('files');
    await tree.rerender(<SimpleNav {...props} availableWidth={20} />);
    expect(tree.queryByRole('link', { name: 'Files' })).toBeNull();
    await tree.rerender(<SimpleNav {...props} availableWidth={80} />);
    expect(tree.getByRole('link', { name: 'Files' })).toBeOnTheScreen();
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
