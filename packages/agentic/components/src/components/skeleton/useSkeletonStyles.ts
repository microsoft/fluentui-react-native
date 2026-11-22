import { attachSlotProps } from '@fluentui-react-native/framework-base';

import type { SkeletonState } from './skeleton.types';

export function useSkeletonStyles_unstable(state: SkeletonState) {
  attachSlotProps(state.root, {
    style: [state.rootChrome, state.userStyle],
  });
}
