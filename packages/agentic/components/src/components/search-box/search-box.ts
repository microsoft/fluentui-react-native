import { directComponent, phasedComponent } from '@fluentui-react-native/framework-base';

import type { SearchBoxProps } from './search-box.types';
import { renderSearchBox_unstable } from './renderSearchBox';
import { useSearchBoxStyles_unstable } from './useSearchBoxStyles';
import { useSearchBox_unstable } from './useSearchBox';

export const SearchBox = phasedComponent<SearchBoxProps>((props) => {
  const state = useSearchBox_unstable(props);
  useSearchBoxStyles_unstable(state);
  return directComponent<SearchBoxProps>(() => renderSearchBox_unstable(state));
});

SearchBox.displayName = 'SearchBox';

export default SearchBox;
