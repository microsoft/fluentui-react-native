import type { NavItemProps } from '../../index';

describe('NavItem props', () => {
  it('distinguishes a route from a controlled category', () => {
    const item: NavItemProps = { value: 'files', label: 'Files', current: true, onNavigate: () => undefined };
    const category: NavItemProps = {
      type: 'category',
      value: 'projects',
      label: 'Projects',
      expanded: false,
      onExpandedChange: () => undefined,
    };
    // @ts-expect-error A category cannot have a navigation callback or a current-page state.
    const both: NavItemProps = { ...category, onNavigate: item.onNavigate, current: true };
    expect([item, category, both]).toHaveLength(3);
  });
});
