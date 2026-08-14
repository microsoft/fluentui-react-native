import type { ListboxItemProps } from './listbox-item.types';
import { useListboxItemStyles_unstable } from './useListboxItemStyles';
import { renderListboxItem_unstable } from './renderListboxItem';
import { useListboxItem_unstable } from './useListboxItem';

export const ListboxItem = (props: ListboxItemProps) => {
  const state = useListboxItem_unstable(props);
  useListboxItemStyles_unstable(state);
  return renderListboxItem_unstable(state);
};

ListboxItem.displayName = 'ListboxItem';

export default ListboxItem;
