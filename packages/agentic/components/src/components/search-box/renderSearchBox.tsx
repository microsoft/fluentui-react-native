/** @jsxImportSource @fluentui-react-native/framework-base */
import { Input } from '../input/input';
import type { SearchBoxState } from './search-box.types';

export function renderSearchBox_unstable(state: SearchBoxState) {
  const Clear = state.clear;
  return (
    <state.root>
      <Input {...state.input} />
      {Clear && <Clear />}
    </state.root>
  );
}
