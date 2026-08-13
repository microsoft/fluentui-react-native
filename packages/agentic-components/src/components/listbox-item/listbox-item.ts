import type { ListboxItemProps } from './listbox-item.types';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderListboxItem_unstable } from './renderListboxItem';
import { useListboxItem_unstable } from './useListboxItem';

export const ListboxItem = (props: ListboxItemProps) => {
  const state = useListboxItem_unstable(props);
  useApplyStyles_unstable(state);
  return renderListboxItem_unstable(state);
};

ListboxItem.displayName = 'ListboxItem';

export default ListboxItem;
