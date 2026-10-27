/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text, View } from 'react-native';

import type { StoryStatusProps } from './story-status.types';

export function StoryStatus({ children, testID, ref, ...viewProps }: StoryStatusProps) {
  return (
    <View {...viewProps} accessible accessibilityLabel={children} accessibilityRole="text" ref={ref} testID={testID}>
      <Text accessible={false}>{children}</Text>
    </View>
  );
}

StoryStatus.displayName = 'StoryStatus';
