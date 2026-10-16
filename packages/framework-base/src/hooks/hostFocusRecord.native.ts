import { TextInput } from 'react-native';

type TextInputFocusRecord = {
  currentlyFocusedInput?: () => unknown;
  // react-native-macos exposes TextInputState.blurInput, which clears the record without dispatching a native command.
  onTextInputBlur?: (instance: unknown) => void;
};

/**
 * React Native macOS routes every host component's focus() through TextInputState, which then records that host as
 * the focused text input. Only TextInput clears the record, so a focused View that unmounts stays recorded and the
 * next ScrollView touch dispatches blur to its removed native view, which Paper reports as an exception. Clear the
 * record without dispatching once the host blurs or detaches.
 */
export function releaseHostFocusRecord(instance: object): void {
  const record = (TextInput as unknown as { State?: TextInputFocusRecord }).State;
  if (record?.onTextInputBlur && record.currentlyFocusedInput?.() === instance) {
    record.onTextInputBlur(instance);
  }
}
