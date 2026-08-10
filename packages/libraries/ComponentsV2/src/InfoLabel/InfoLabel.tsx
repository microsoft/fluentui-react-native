import * as React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export interface InfoLabelProps {
  children?: React.ReactNode;
  info?: React.ReactNode;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function InfoLabel({children, info = 'More information', required, size = 'medium'}: InfoLabelProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={styles.root}>
      <Text style={[styles.label, styles[size]]}>{children}{required ? ' *' : ''}</Text>
      <Pressable accessibilityLabel="More information" accessibilityRole="button" onPress={() => setOpen(value => !value)}>
        <Text style={styles.icon}>ⓘ</Text>
      </Pressable>
      {open ? <View style={styles.popover}><Text style={styles.info}>{info}</Text></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {color: '#0f6cbd', fontSize: 16},
  info: {color: '#ffffff', fontSize: 12},
  label: {color: '#242424', fontWeight: '600'},
  large: {fontSize: 16},
  medium: {fontSize: 14},
  popover: {backgroundColor: '#242424', borderRadius: 4, left: 0, padding: 8, position: 'absolute', top: 24, zIndex: 2},
  root: {alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 4, position: 'relative'},
  small: {fontSize: 12},
});
