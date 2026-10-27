/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

import { Text } from '../../components/text/text';
import type { StoryGroupProps } from './story-group.types';

export function StoryGroup({ children, label, labelTestID, labelStyle, contentStyle, style, ref, ...viewProps }: StoryGroupProps) {
  return (
    <View {...viewProps} ref={ref} style={[styles.root, style]}>
      {labelTestID ? (
        <View accessible accessibilityLabel={label} accessibilityRole="text" testID={labelTestID}>
          <Text accessible={false} style={[styles.label, labelStyle]}>
            {label}
          </Text>
        </View>
      ) : (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

StoryGroup.displayName = 'StoryGroup';

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
});
