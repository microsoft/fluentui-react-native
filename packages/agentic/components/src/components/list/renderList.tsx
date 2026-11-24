/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ListState } from './list.types';
import { ManagedListEntry, ReadingListEntry } from './listEntry';

export function renderList_unstable(state: ListState) {
  const Entry = state.navigationMode === 'items' ? ManagedListEntry : ReadingListEntry;
  return (
    <state.root>
      {state.items.map((item, index) => (
        <Entry key={item.key} item={item} state={state} position={index + 1} />
      ))}
    </state.root>
  );
}
