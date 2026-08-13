/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent, phasedComponent } from '@fluentui-react-native/framework-base';

import { renderSkeleton_unstable } from './renderSkeleton';
import { useApplyStyles_unstable } from './useApplyStyles';
import { useSkeleton_unstable } from './useSkeleton';
import type { SkeletonProps } from './skeleton.types';

export const Skeleton = phasedComponent<SkeletonProps>((props) => {
  const state = useSkeleton_unstable(props);
  useApplyStyles_unstable(state);

  return directComponent<SkeletonProps>(() => renderSkeleton_unstable(state));
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;
