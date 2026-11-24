import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Breadcrumb } from './breadcrumb';
import type { BreadcrumbAncestor } from './breadcrumb.types';
import { partitionTrail } from './breadcrumbLayout';

describe('Breadcrumb', () => {
  it('exposes an ancestor and named current location without a redundant action', async () => {
    const onNavigate = jest.fn();
    const tree = await render(
      <Breadcrumb
        accessibilityLabel="Location"
        overflowLabel="Earlier locations"
        items={[
          { key: 'root', label: 'Workspace', onNavigate },
          { key: 'current', label: 'Files' },
        ]}
      />,
    );
    expect(tree.getByRole('group', { name: 'Location' })).toBeOnTheScreen();
    expect(tree.getByRole('text', { name: 'Files' })).toBeOnTheScreen();
    expect(tree.queryByRole('link', { name: 'Files' })).toBeNull();
    expect(tree.queryByRole('button', { name: 'Earlier locations' })).toBeNull();
    await fireEvent(tree.getByRole('link', { name: 'Workspace' }), 'accessibilityTap');
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('keeps the edges, collapses ordered middle items, and restores them as width permits', () => {
    const ancestors: BreadcrumbAncestor[] = ['root', 'second', 'third', 'fourth'].map((key) => ({
      key,
      label: key,
      onNavigate: () => undefined,
    }));
    const widths = [30, 60, 90, 40, 35];
    expect(partitionTrail(ancestors, widths, 400, 4, 12, 24)).toMatchObject({ leading: ancestors, overflow: [] });
    expect(partitionTrail(ancestors, widths, 190, 4, 12, 24)).toEqual({
      leading: ancestors.slice(0, 1),
      overflow: ancestors.slice(1, 3),
      trailing: ancestors.slice(3),
    });
    expect(partitionTrail(ancestors, widths, 90, 4, 12, 24)).toEqual({
      leading: ancestors.slice(0, 1),
      overflow: ancestors.slice(1),
      trailing: [],
    });
  });
});
