/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text, View } from 'react-native';

/** Fabric paragraphs are not standalone AX elements on macOS; expose the status on a named View. */
export function StoryStatus({ children, testID }: { children: string; testID: string }) {
  return (
    <View accessible accessibilityLabel={children} accessibilityRole="text" testID={testID}>
      <Text accessible={false}>{children}</Text>
    </View>
  );
}
