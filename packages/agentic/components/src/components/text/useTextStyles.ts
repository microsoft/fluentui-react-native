import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { getTextStyles } from './text.styles';
import type { TextState } from './text.types';

export function useTextStyles_unstable(state: TextState): void {
  const styles = getTextStyles(state);

  attachSlotProps(state.root, {
    style: [styles.root, state.userStyle],
  });
}
