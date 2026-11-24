/** @jsxImportSource @fluentui-react-native/framework-base */
import type { TreeState } from './tree.types';
import { TreeEntry } from './treeEntry';

export function renderTree_unstable(state: TreeState) {
  return (
    <state.root>
      {state.roots.map((value) => (
        <TreeEntry key={value} state={state} value={value} />
      ))}
    </state.root>
  );
}
