import { renderSearchBox_unstable } from './renderSearchBox';
import type { SearchBoxProps } from './search-box.types';
import { useSearchBox_unstable } from './useSearchBox';
import { useSearchBoxStyles_unstable } from './useSearchBoxStyles';

export const SearchBox = (props: SearchBoxProps) => {
  const state = useSearchBox_unstable(props);
  useSearchBoxStyles_unstable(state);
  return renderSearchBox_unstable(state);
};
SearchBox.displayName = 'SearchBox';
