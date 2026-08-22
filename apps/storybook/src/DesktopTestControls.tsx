/**
 * On-device desktop test controls.
 *
 * The device cannot run a test runner or native automation, so this panel only sends allowlisted
 * run requests over the Storybook channel and renders the progress returned on that same channel.
 * It never receives or executes code, learns a command line, or discovers another server.
 */
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DesktopTestHost } from './useDesktopTestHost';

export type DesktopTestControlsProps = {
  /** Story currently shown by the Storybook UI, used by "Run current". */
  currentStoryId?: string;
  /** Channel-backed desktop host state and commands. */
  host: DesktopTestHost;
};

export const DesktopTestControls = ({ currentStoryId, host }: DesktopTestControlsProps) => {
  const { available, busy, error, status } = host;

  const summary = useMemo(() => {
    if (error) {
      return `Error: ${error}`;
    }
    if (!status) {
      return available ? 'Ready' : 'Waiting for the desktop host';
    }
    const failed = status.results.filter((result) => result.status !== 'passed' && result.status !== 'skipped');
    if (status.state === 'running') {
      return `Running… ${status.results.length} finished`;
    }
    return `${status.state}: ${status.results.length - failed.length} passed, ${failed.length} failed`;
  }, [available, error, status]);

  const running = busy || status?.state === 'running';
  const disabled = !available || running;
  const currentHasTest = currentStoryId !== undefined && host.testedStoryIds.includes(currentStoryId);

  return (
    <View style={styles.root} testID="desktop-test-controls">
      <View style={styles.row}>
        <ControlButton
          label="Run current test"
          disabled={disabled || !currentHasTest}
          onPress={() => host.start('current', currentStoryId)}
          testID="desktop-test-run-current"
        />
        <ControlButton label="Run all tests" disabled={disabled} onPress={() => host.start('all')} testID="desktop-test-run-all" />
        <ControlButton label="Cancel" disabled={!running} onPress={host.cancel} testID="desktop-test-cancel" />
      </View>
      <View accessibilityLabel={summary} accessible testID="desktop-test-status">
        <Text style={styles.summary}>{summary}</Text>
      </View>
      {status?.results.slice(-4).map((result) => (
        <Text key={result.testId} style={styles.result} numberOfLines={2}>
          {result.status === 'passed' ? '✓' : '✗'} {result.title}
          {result.error ? ` — ${result.error.message}` : ''}
        </Text>
      ))}
    </View>
  );
};

type ControlButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  testID: string;
};

const ControlButton = ({ disabled, label, onPress, testID }: ControlButtonProps) => (
  <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={styles.button} testID={testID}>
    <Text style={disabled ? styles.buttonLabelDisabled : styles.buttonLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    borderColor: '#8a8886',
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 12,
  },
  buttonLabelDisabled: {
    color: '#a19f9d',
    fontSize: 12,
  },
  result: {
    fontSize: 11,
  },
  root: {
    borderTopColor: '#edebe9',
    borderTopWidth: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  summary: {
    fontSize: 12,
    fontWeight: '600',
  },
});
