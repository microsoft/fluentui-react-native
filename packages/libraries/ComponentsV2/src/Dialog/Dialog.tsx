import * as React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {InteractionEvent} from '@fluentui/react-native';

import {Button} from '../Button';
import {dialogTokens} from './Dialog.tokens';
import type {DialogOpenChangeData, DialogProps} from './Dialog.types';

export function Dialog({
  actions,
  backdropAppearance = 'dimmed',
  children,
  closeLabel = 'Close',
  defaultOpen = false,
  modalType = 'modal',
  onOpenChange,
  open,
  preventClose = false,
  style,
  title = 'Dialog title',
  titleAction,
  trigger,
}: DialogProps): React.ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? uncontrolledOpen;

  const requestOpenChange = React.useCallback(
    (event: InteractionEvent, data: DialogOpenChangeData) => {
      if (!data.open && preventClose) {
        return;
      }
      if (open === undefined) {
        setUncontrolledOpen(data.open);
      }
      onOpenChange?.(event, data);
    },
    [onOpenChange, open, preventClose],
  );

  const openDialog = (event: InteractionEvent) =>
    requestOpenChange(event, {open: true, reason: 'trigger'});
  const closeDialog = (event: InteractionEvent, reason: DialogOpenChangeData['reason']) =>
    requestOpenChange(event, {open: false, reason});

  return (
    <View style={styles.root}>
      {trigger ? (
        <Pressable accessibilityRole="button" onPress={openDialog}>
          {trigger}
        </Pressable>
      ) : null}
      {currentOpen ? (
        <View
          accessibilityRole={modalType === 'alert' ? 'alert' : undefined}
          accessibilityViewIsModal={modalType !== 'non-modal'}
          style={[
            styles.backdrop,
            backdropAppearance === 'opaque' && styles.opaqueBackdrop,
            backdropAppearance === 'transparent' && styles.transparentBackdrop,
          ]}
        >
          <Pressable
            accessibilityLabel="Dialog backdrop"
            accessibilityRole="button"
            disabled={modalType !== 'non-modal' || preventClose}
            onPress={event => closeDialog(event, 'backdropClick')}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.surface, style]}>
            <View style={styles.titleRow}>
              {typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}
              {titleAction}
              {!preventClose ? (
                <Button
                  accessibilityLabel={closeLabel}
                  appearance="subtle"
                  onClick={event => closeDialog(event, 'closeButton')}
                  size="small"
                >
                  ×
                </Button>
              ) : null}
            </View>
            <View style={styles.content}>{children}</View>
            {actions ? <View style={styles.actions}>{actions}</View> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: dialogTokens.backdropDimmed,
    justifyContent: 'center',
    minHeight: 260,
    padding: 20,
    position: 'relative',
    width: '100%',
  },
  content: {
    gap: 10,
  },
  opaqueBackdrop: {
    backgroundColor: dialogTokens.backdropOpaque,
  },
  root: {
    alignSelf: 'stretch',
  },
  surface: {
    backgroundColor: dialogTokens.surfaceBackground,
    borderColor: dialogTokens.borderColor,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 8,
    gap: 16,
    maxWidth: dialogTokens.maxWidth,
    minWidth: dialogTokens.minWidth,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.18,
    shadowRadius: 16,
    width: '80%',
  },
  title: {
    color: '#242424',
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  transparentBackdrop: {
    backgroundColor: 'transparent',
  },
});
