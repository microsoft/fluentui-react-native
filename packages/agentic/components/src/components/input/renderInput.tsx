/** @jsxImportSource @fluentui-react-native/framework-base */
import type { InputState } from './input.types';

export function renderInput_unstable(state: InputState) {
  const {
    iconEnd: IconEnd,
    iconEnd1: IconEnd1,
    iconEnd2: IconEnd2,
    iconStart: IconStart,
    iconTextStack: IconTextStack,
    textInput: TextInputSlot,
  } = state;

  const trailingIcons =
    IconEnd && (IconEnd1 || IconEnd2) ? (
      <IconEnd>
        {IconEnd1 && <IconEnd1 />}
        {IconEnd2 && IconEnd1 && <IconEnd2 />}
      </IconEnd>
    ) : null;

  return (
    <state.root>
      <state.contents>
        <IconTextStack>
          {IconStart && <IconStart />}
          <TextInputSlot />
        </IconTextStack>
        {trailingIcons}
        {state.underline && <state.underline />}
      </state.contents>
    </state.root>
  );
}
