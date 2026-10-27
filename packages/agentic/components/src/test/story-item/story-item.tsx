/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

import { Text } from '../../components/text/text';
import type { StoryItemProps } from './story-item.types';

export function StoryItem({ children, label, labelStyle, style, ref, ...viewProps }: StoryItemProps) {
  return (
    <View {...viewProps} ref={ref} style={[styles.root, style]}>
      {children}
      <Text style={labelStyle}>{label}</Text>
    </View>
  );
}

StoryItem.displayName = 'StoryItem';

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 8,
  },
});
