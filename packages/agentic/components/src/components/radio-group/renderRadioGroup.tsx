/** @jsxImportSource @fluentui-react-native/framework-base */
import { RadioGroupContext } from './RadioGroupContext';
import type { RadioGroupState } from './radio-group.types';

export function renderRadioGroup_unstable(state: RadioGroupState) {
  return (
    <RadioGroupContext.Provider value={state.contextValue}>
      <state.root>
        <state.legend />
        <state.options>{state.children}</state.options>
      </state.root>
    </RadioGroupContext.Provider>
  );
}
