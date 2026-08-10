import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {dividerColors} from './Divider.tokens';
import type {DividerProps} from './Divider.types';

export function Divider({
  alignContent = 'center',
  appearance = 'default',
  children,
  inset = 0,
  orientation = 'horizontal',
  style,
}: DividerProps): React.ReactElement {
  const vertical = orientation === 'vertical';
  const lineStyle = [
    styles.line,
    vertical ? styles.verticalLine : styles.horizontalLine,
    {backgroundColor: dividerColors[appearance]},
  ];

  if (!children) {
    return (
      <View
        accessibilityLabel="Divider"
        style={[
          vertical ? styles.verticalRoot : styles.horizontalRoot,
          vertical ? {marginVertical: inset} : {marginHorizontal: inset},
          style,
        ]}
      >
        <View style={lineStyle} />
      </View>
    );
  }

  return (
    <View
      accessibilityLabel="Divider"
      style={[
        styles.contentRoot,
        vertical && styles.verticalContentRoot,
        vertical ? styles.verticalRoot : styles.horizontalRoot,
        vertical ? {marginVertical: inset} : {marginHorizontal: inset},
        alignContent === 'start' && styles.startContent,
        alignContent === 'end' && styles.endContent,
        style,
      ]}
    >
      {alignContent !== 'start' ? <View style={lineStyle} /> : null}
      {typeof children === 'string' ? <Text style={styles.content}>{children}</Text> : children}
      {alignContent !== 'end' ? <View style={lineStyle} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {color: '#424242', fontSize: 12, paddingHorizontal: 8},
  contentRoot: {alignItems: 'center', flexDirection: 'row'},
  endContent: {justifyContent: 'flex-end'},
  horizontalLine: {height: 1},
  horizontalRoot: {alignItems: 'center', alignSelf: 'stretch', flexDirection: 'row', minHeight: 20},
  line: {flex: 1},
  startContent: {justifyContent: 'flex-start'},
  verticalLine: {width: 1},
  verticalContentRoot: {flexDirection: 'column'},
  verticalRoot: {alignSelf: 'center', flexDirection: 'column', minHeight: 120, width: 20},
});
