import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { List } from './list';
import type { ListActionDetail } from './list.types';

const reports = [
  { key: 'draft', label: 'Report', testID: 'draft' },
  { key: 'final', label: 'Report', testID: 'final' },
];
describe('List', () => {
  it('exposes passive rows without action targets or false unchecked states', async () => {
    const tree = await render(<List items={reports} accessibilityLabel="Reading list" />);
    expect(tree.getByRole('list', { name: 'Reading list' })).toBeOnTheScreen();
    expect(tree.getAllByRole('listitem', { name: 'Report' })).toHaveLength(2);
    expect(tree.getByTestId('draft').props.focusable).toBe(false);
    expect(tree.getByTestId('draft').props.onPress).toBeUndefined();
    expect(tree.getByTestId('draft').props.accessibilityState?.selected).toBeUndefined();
  });

  it('requests primary action before selection and lets the action veto selection', async () => {
    const order: string[] = [];
    const onAction = (key: string, detail: ListActionDetail) => {
      order.push(`action:${key}`);
      if (key === 'draft') detail.preventSelection();
    };
    const onSelectionChange = (next: readonly string[]) => order.push(`selection:${next.join(',')}`);
    const tree = await render(<List items={reports} selectionMode="single" onAction={onAction} onSelectionChange={onSelectionChange} />);
    await fireEvent.press(tree.getByTestId('draft'), { nativeEvent: {} });
    await fireEvent.press(tree.getByTestId('final'), { nativeEvent: {} });
    expect(order).toEqual(['action:draft', 'action:final', 'selection:final']);
    await fireEvent.press(tree.getByTestId('draft'), { nativeEvent: { key: ' ', code: 'Space' } });
    expect(order.at(-1)).toBe('selection:draft');
  });

  it('does not move selection by index or assume a controlled choice was accepted', async () => {
    const select = jest.fn();
    const tree = await render(<List items={reports} selectedKeys={['final']} selectionMode="multiple" onSelectionChange={select} />);
    await fireEvent.press(tree.getByTestId('draft'), { nativeEvent: {} });
    expect(select).toHaveBeenCalledWith(['final', 'draft'], { key: 'draft' });
    await tree.rerender(<List items={[...reports].reverse()} selectedKeys={['final']} selectionMode="multiple" />);
    expect(tree.getByTestId('final').props.accessibilityState.selected).toBe(true);
    expect(tree.getByTestId('draft').props.accessibilityState.selected).toBe(false);
  });
});
