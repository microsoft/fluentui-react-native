import type { ListItemProps } from './list-item.types';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderListItem_unstable } from './renderListItem';
import { useListItem_unstable } from './useListItem';

/**
 * A ListItem row component.
 */
export const ListItem = (props: ListItemProps) => {
  const state = useListItem_unstable(props);
  useApplyStyles_unstable(state);
  return renderListItem_unstable(state);
};

ListItem.displayName = 'ListItem';

export default ListItem;
