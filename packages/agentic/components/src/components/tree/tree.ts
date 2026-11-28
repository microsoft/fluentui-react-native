import { renderTree_unstable } from './renderTree';
import type { TreeProps } from './tree.types';
import { useTree_unstable } from './useTree';
import { useTreeStyles_unstable } from './useTreeStyles';

export const Tree = (props: TreeProps) => {
  const state = useTree_unstable(props);
  useTreeStyles_unstable(state);
  return renderTree_unstable(state);
};
Tree.displayName = 'Tree';
