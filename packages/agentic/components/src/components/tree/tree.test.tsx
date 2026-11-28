import { fireEvent } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { render } from '../../common/renderWithTheme';
import { buildHierarchy } from '../../common/keyedHierarchy';
import { Tree } from './tree';
import type { TreeNode } from './tree.types';

const items: readonly TreeNode[] = [
  {
    key: 'folder',
    testID: 'folder',
    label: 'Folder',
    children: [
      { key: 'readme', testID: 'readme', label: 'Readme' },
      { key: 'guide', testID: 'guide', label: 'Guide' },
      { key: 'system', label: 'System', disabled: true },
    ],
  },
];

describe('Tree', () => {
  it('omits transparent Flex fills on the Win32 host without overriding caller colors', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    try {
      const tree = await render(<Tree testID="tree" accessibilityLabel="Files" items={items} style={{ backgroundColor: '#eee' }} />);
      expect(StyleSheet.flatten(tree.getByTestId('tree').props.style).backgroundColor).toBe('#eee');
      expect(StyleSheet.flatten(tree.getByTestId('folder').props.style).backgroundColor).toBeUndefined();
    } finally {
      platform.restore();
    }
  });

  it('cascades through collapsed descendants and derives mixed state from controlled changes', async () => {
    const onSelectionChange = jest.fn();
    const props = { items, accessibilityLabel: 'Files', selectionMode: 'multiple' as const, onSelectionChange };
    const tree = await render(<Tree {...props} />);
    const folder = () => tree.getByTestId('folder');
    expect(tree.queryByTestId('guide')).toBeNull();
    await fireEvent.press(folder(), { nativeEvent: { code: 'Space' } });
    expect(onSelectionChange.mock.calls).toEqual([[['readme', 'guide'], { key: 'folder' }]]);
    expect(folder().props.accessibilityState.checked).toBe(true);
    await tree.rerender(<Tree {...props} selectedKeys={['readme']} />);
    expect(folder().props.accessibilityState.checked).toBe('mixed');
  });

  it('rejects duplicate keys and cycles in the graph', () => {
    const cyclic: TreeNode[] = [];
    cyclic.push({ key: 'cycle', label: 'Cycle', children: cyclic });
    const build = (nodes: readonly TreeNode[]) =>
      buildHierarchy(
        nodes,
        (entry) => entry.key,
        (entry) => entry.children,
      );
    expect(() => build(cyclic)).toThrow(/cycles/);
    expect(() => build([...items, items[0]])).toThrow(/unique/);
  });
});
