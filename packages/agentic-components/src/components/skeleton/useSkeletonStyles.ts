import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { skeletonStyles, getSkeletonThemeStyles } from './skeleton.styles';
import type { SkeletonState } from './skeleton.types';

export function useSkeletonStyles_unstable(state: SkeletonState) {
  const themeStyles = getSkeletonThemeStyles(state);

  attachSlotProps(state.root, {
    style: [skeletonStyles.root, themeStyles.root, state.userStyle],
  });
}
