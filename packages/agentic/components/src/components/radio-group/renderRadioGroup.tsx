/** @jsxImportSource @fluentui-react-native/framework-base */
import type { RadioGroupState } from './radio-group.types';
import { RadioGroupChoice } from './radioGroupChoice';

export function renderRadioGroup_unstable(state: RadioGroupState) {
  const Legend = state.legend;
  return (
    <state.root>
      {Legend && <Legend />}
      <state.options>
        {state.items.map((option) => (
          <RadioGroupChoice
            key={option.value}
            option={option}
            selected={option.value === state.selectedValue}
            focus={state.focus}
            select={state.select}
          />
        ))}
      </state.options>
    </state.root>
  );
}
