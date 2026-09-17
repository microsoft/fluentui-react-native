/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SearchBoxState } from './search-box.types';

export function renderSearchBox_unstable(state: SearchBoxState) {
  const {
    clearButton: ClearButton,
    clearButtonGroup: ClearButtonGroup,
    icon: SearchIcon,
    iconTextStack: IconTextStack,
    textInput: TextInputSlot,
  } = state;

  return (
    <state.root>
      <state.contents>
        <IconTextStack>
          {SearchIcon && <SearchIcon />}
          <TextInputSlot ref={state.textInputRef} />
        </IconTextStack>
        {ClearButtonGroup && ClearButton && (
          <ClearButtonGroup>
            <ClearButton />
          </ClearButtonGroup>
        )}
        {state.underline && <state.underline />}
      </state.contents>
    </state.root>
  );
}
