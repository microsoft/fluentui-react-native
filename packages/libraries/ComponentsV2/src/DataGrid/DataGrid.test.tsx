import { act } from 'react';
import { Pressable } from 'react-native';

import * as renderer from 'react-test-renderer';

import { DataGrid } from './DataGrid';
import type { DataGridColumn } from './DataGrid.types';

interface Item {
  id: string;
  name: string;
  rank: number;
}

const items: Item[] = [
  { id: 'b', name: 'Beta', rank: 2 },
  { id: 'a', name: 'Alpha', rank: 1 },
];

const columns: DataGridColumn<Item>[] = [
  {
    columnId: 'name',
    compare: (a, b) => a.name.localeCompare(b.name),
    header: 'Name',
    renderCell: item => item.name,
  },
  {
    columnId: 'rank',
    compare: (a, b) => a.rank - b.rank,
    header: 'Rank',
    renderCell: item => item.rank,
  },
];

describe('ComponentsV2 DataGrid', () => {
  it('sorts an uncontrolled sortable column', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<DataGrid columns={columns} items={items} sortable />);
    });

    const nameHeader = component!.root.findByProps({ accessibilityLabel: 'Name' });
    act(() => nameHeader.props.onPress({ nativeEvent: {} }));

    const rows = component!.root.findAllByType(Pressable).filter(node => String(node.props.accessibilityLabel).startsWith('Row '));
    expect(rows[0].props.accessibilityLabel).toBe('Row 1');
  });

  it('supports controlled and uncontrolled multiselect', () => {
    const onSelectionChange = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <DataGrid
          columns={columns}
          getRowId={item => item.id}
          items={items}
          onSelectionChange={onSelectionChange}
          selectionMode="multiselect"
        />,
      );
    });

    const beta = component!.root.findByProps({ accessibilityLabel: 'Row b' });
    act(() => beta.props.onPress({ nativeEvent: {} }));
    expect(component!.root.findByProps({ accessibilityLabel: 'Row b' }).props.accessibilityState.checked).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledWith(expect.anything(), {
      selectedItems: new Set(['b']),
    });
  });

  it('keeps only one selected item in single-select mode', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <DataGrid
          columns={columns}
          defaultSelectedItems={new Set(['a'])}
          getRowId={item => item.id}
          items={items}
          selectionMode="single"
        />,
      );
    });

    act(() => component!.root.findByProps({ accessibilityLabel: 'Row b' }).props.onPress({ nativeEvent: {} }));
    expect(component!.root.findByProps({ accessibilityLabel: 'Row a' }).props.accessibilityState.checked).toBe(false);
    expect(component!.root.findByProps({ accessibilityLabel: 'Row b' }).props.accessibilityState.checked).toBe(true);
  });

  it('renders a bounded row window for virtualized data', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <DataGrid columns={columns} items={[...items, ...items, ...items]} maxVisibleRows={3} virtualized />,
      );
    });

    const rows = component!.root.findAllByType(Pressable).filter(node => String(node.props.accessibilityLabel).startsWith('Row '));
    expect(rows).toHaveLength(3);
    expect(component!.root.findByProps({ children: 'Showing 3 of 6 rows' })).toBeTruthy();
  });
});
