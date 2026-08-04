import type { ButtonState } from './button.types';
import { attachSlotProps } from '@fluentui-react-native/framework-base';

/**
 * This hook applies the appropriate styles to the button slots based on the current state.
 * - this is a hook to allow useMemo if appropriate for performance optimization
 * @param state the state containing the slots to attach the styles to
 */
export function useApplyStyles_unstable(state: ButtonState) {
  // Attach styles to the slots depending on the state of the component
  // use attachSlotProps to attach styles to the button slots based on the current state
}
