import * as React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {InteractionEvent} from '@fluentui/react-native';

import {Button} from '../Button';
import {drawerSizeTokens} from './Drawer.tokens';
import type {DrawerOpenChangeData, DrawerProps} from './Drawer.types';

export function Drawer({
  children,
  defaultOpen = false,
  modal = true,
  onOpenChange,
  open,
  position = 'end',
  preventClose = false,
  separator = false,
  size = 'medium',
  style,
  title = 'Drawer title',
  type = 'overlay',
}: DrawerProps): React.ReactElement | null {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? uncontrolledOpen;
  const width = typeof size === 'number' ? size : drawerSizeTokens[size];

  const requestClose = (event: InteractionEvent, reason: DrawerOpenChangeData['reason']) => {
    if (preventClose) {
      return;
    }
    if (open === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(event, {open: false, reason});
  };

  if (!currentOpen) {
    return null;
  }

  return (
    <View
      accessibilityViewIsModal={type === 'overlay' && modal}
      style={[
        styles.stage,
        type === 'inline' && styles.inlineStage,
        position === 'start' ? styles.startStage : styles.endStage,
      ]}
    >
      {type === 'overlay' ? (
        <Pressable
          accessibilityLabel="Drawer backdrop"
          accessibilityRole="button"
          disabled={!modal || preventClose}
          onPress={event => requestClose(event, 'backdropClick')}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        style={[
          styles.surface,
          {maxWidth: '100%', width},
          separator && (position === 'start' ? styles.startSeparator : styles.endSeparator),
          style,
        ]}
      >
        <View style={styles.header}>
          {typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}
          {!preventClose ? (
            <Button
              accessibilityLabel="Close drawer"
              appearance="subtle"
              onClick={event => requestClose(event, 'closeButton')}
              size="small"
            >
              ×
            </Button>
          ) : null}
        </View>
        <View style={styles.body}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {flex: 1, gap: 12},
  endSeparator: {borderLeftColor: '#d1d1d1', borderLeftWidth: 1},
  endStage: {justifyContent: 'flex-end'},
  header: {alignItems: 'center', flexDirection: 'row', gap: 8},
  inlineStage: {backgroundColor: 'transparent'},
  stage: {backgroundColor: 'rgba(0, 0, 0, 0.32)', flexDirection: 'row', minHeight: 300, width: '100%'},
  startSeparator: {borderRightColor: '#d1d1d1', borderRightWidth: 1},
  startStage: {justifyContent: 'flex-start'},
  surface: {backgroundColor: '#ffffff', elevation: 8, gap: 16, padding: 20, shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 12},
  title: {color: '#242424', flex: 1, fontSize: 20, fontWeight: '600'},
});
