import type { ListProps } from './list.types';
import { renderList_unstable } from './renderList';
import { useList_unstable } from './useList';
import { useListStyles_unstable } from './useListStyles';

export const List = (props: ListProps) => {
  const state = useList_unstable(props);
  useListStyles_unstable(state);
  return renderList_unstable(state);
};
List.displayName = 'List';
