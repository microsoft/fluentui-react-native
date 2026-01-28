import { Animated } from 'react-native';

import { phasedComponent } from '@fluentui-react-native/framework-base';

import type { AnimatedIndicatorProps } from './TabListAnimatedIndicator.types';
import { tablistAnimatedIndicatorName } from './TabListAnimatedIndicator.types';
import { useAnimatedIndicatorStyles } from './useAnimatedIndicatorStyles';

export const TabListAnimatedIndicator = phasedComponent<AnimatedIndicatorProps>((props) => {
  const styles = useAnimatedIndicatorStyles(props);
  return () => {
    return <Animated.View style={styles} />;
  };
});
TabListAnimatedIndicator.displayName = tablistAnimatedIndicatorName;

export default TabListAnimatedIndicator;
