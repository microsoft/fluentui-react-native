import type { ListItemProps } from './list-item.types';
import { useListItemStyles_unstable } from './useListItemStyles';
import { renderListItem_unstable } from './renderListItem';
import { useListItem_unstable } from './useListItem';

/**
 * A ListItem row component.
 */
export const ListItem = (props: ListItemProps) => {
  const state = useListItem_unstable(props);
  useListItemStyles_unstable(state);
  return renderListItem_unstable(state);
};

ListItem.displayName = 'ListItem';

export default ListItem;
