import { fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { render } from '../../common/renderWithTheme';
import { TreeItem } from './tree-item';

describe('TreeItem', () => {
  it('routes Windows Fabric ExpandCollapse requests without toggling selection', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'windows' as typeof Platform.OS);
    try {
      const onExpandedChange = jest.fn();
      const onSelection = jest.fn();
      const tree = await render(
        <TreeItem
          value="folder"
          label="Folder"
          primaryTestID="row"
          level={1}
          position={1}
          setSize={1}
          expanded={false}
          onExpandedChange={onExpandedChange}
          checked="mixed"
          onSelection={onSelection}
        />,
      );
      const row = tree.getByTestId('row');
      expect(row.props.accessibilityActions).toContainEqual({ name: 'expand' });
      await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'expand' } });
      expect(onExpandedChange.mock.calls).toEqual([[true, 'folder']]);
      expect(onSelection).not.toHaveBeenCalled();
    } finally {
      platform.restore();
    }
  });

  it('routes primary, checked selection, and a sibling action independently', async () => {
    const onExpandedChange = jest.fn();
    const onSelection = jest.fn();
    const more = jest.fn();
    const tree = await render(
      <TreeItem
        value="folder"
        label="Folder"
        primaryTestID="row"
        level={1}
        position={1}
        setSize={1}
        expanded={false}
        onExpandedChange={onExpandedChange}
        checked="mixed"
        layout="checkbox"
        onSelection={onSelection}
        quickAction={{ label: 'Folder options', onPress: more }}
      />,
    );
    const row = tree.getByTestId('row');
    expect(row.props.accessibilityState).toMatchObject({ checked: 'mixed', expanded: false });
    await fireEvent.press(row, { nativeEvent: { code: 'Space', key: ' ' } });
    await fireEvent(row, 'accessibilityTap');
    await fireEvent(tree.getByRole('button', { name: 'Folder options' }), 'accessibilityTap');
    expect(onExpandedChange.mock.calls).toEqual([[true, 'folder']]);
    expect(onSelection.mock.calls).toEqual([['folder']]);
    expect(more.mock.calls).toEqual([['folder']]);
  });
});
