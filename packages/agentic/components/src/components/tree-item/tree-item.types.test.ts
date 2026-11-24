import type { TreeItemProps } from '../../index';

describe('TreeItem types', () => {
  it('distinguishes a disclosed branch, a leaf, and their selection models', () => {
    const row = { value: 'files', label: 'Files', level: 1, position: 1, setSize: 1 };
    const leaf: TreeItemProps = { ...row, onActivate: (_key): void => undefined };
    const branch: TreeItemProps = { ...row, expanded: false, onExpandedChange: (_expanded): void => undefined, checked: 'mixed' };
    // @ts-expect-error Branch disclosure and primary leaf activation are mutually exclusive.
    const both: TreeItemProps = { ...branch, onActivate: (_key): void => undefined };
    // @ts-expect-error Selection and checked state are different native models.
    const twoStates: TreeItemProps = { ...row, selected: true, checked: 'mixed' };
    expect([leaf, branch, both, twoStates]).toHaveLength(4);
  });
});
