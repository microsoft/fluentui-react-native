/** @jsxRuntime classic */
/** @jsx withSlots */
import { TextV1 } from '@fluentui-react-native/text';

if (__DEV__) {
  console.warn(
    'The @fluentui-react-native/experimental-text package is deprecated for win32. The contents of this package have been moved to @fluentui-react-native/text. If you need to use the Text component from this package, please use TextV1 from @fluentui-react-native/text.',
  );
}

export const Text = TextV1;
export default Text;
