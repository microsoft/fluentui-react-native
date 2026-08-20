/**
 * On-device desktop test controls.
 *
 * The device cannot run a test runner or native automation, so this panel only sends allowlisted
 * run requests to the loopback desktop test service and renders the progress it streams back.
 * It never receives or executes code, and it never learns a command line.
 *
 * The service announces its loopback URL and per-boot token over the Storybook channel (see
 * `useDesktopTestService`). Until an announcement arrives the controls render as unavailable
 * rather than guessing an endpoint.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DesktopServiceEndpoint } from './useDesktopTestService';

const PROTOCOL_VERSION = 1;

type RunState = 'idle' | 'running' | 'passed' | 'failed' | 'cancelled' | 'error';

type TestResult = {
  testId: string;
  storyId?: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'infrastructureError';
  durationMs: number;
  error?: { message: string };
};

type RunStatus = {
  runId: string;
  state: RunState;
  results: TestResult[];
  message?: string;
};

export type DesktopTestControlsProps = {
  /** Story currently shown by the Storybook UI, used by "Run current". */
  currentStoryId?: string;
  /** Endpoint announced by the host-side service, or undefined until one arrives. */
  service?: DesktopServiceEndpoint;
};

async function request(serviceUrl: string, token: string, pathname: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${serviceUrl}${pathname}`, {
    ...init,
    headers: { ...init?.headers, authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((body as { error?: string }).error ?? `Desktop test service returned ${response.status}`);
  }
  return body;
}

export const DesktopTestControls = ({ currentStoryId, service }: DesktopTestControlsProps) => {
  const serviceUrl = service?.url;
  const serviceToken = service?.token;
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<RunStatus | undefined>();
  const [error, setError] = useState<string | undefined>();
  // Set synchronously on press so a second tap cannot issue a second request while the first is
  // still in flight; the service also rejects a concurrent run, this just avoids the round trip.
  const [busy, setBusy] = useState(false);

  const configured = Boolean(serviceUrl && serviceToken);

  useEffect(() => {
    if (!serviceUrl) {
      return undefined;
    }
    let cancelled = false;
    fetch(`${serviceUrl}/v1/health`)
      .then((response) => response.ok)
      .then((ok) => {
        if (!cancelled) {
          setAvailable(ok);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailable(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serviceUrl]);

  const poll = useCallback(
    async (runId: string) => {
      if (!serviceUrl || !serviceToken) {
        return;
      }
      for (;;) {
        const next = (await request(serviceUrl, serviceToken, `/v1/runs/${runId}`)) as RunStatus;
        setStatus(next);
        if (next.state !== 'running') {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    },
    [serviceToken, serviceUrl],
  );

  const start = useCallback(
    async (mode: 'current' | 'all') => {
      if (!serviceUrl || !serviceToken) {
        return;
      }
      setError(undefined);
      setBusy(true);
      try {
        const started = (await request(serviceUrl, serviceToken, '/v1/runs', {
          method: 'POST',
          body: JSON.stringify({
            protocolVersion: PROTOCOL_VERSION,
            mode: mode === 'all' ? 'all' : 'selected',
            storyIds: mode === 'all' ? undefined : currentStoryId ? [currentStoryId] : [],
          }),
        })) as RunStatus;
        setStatus(started);
        await poll(started.runId);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught));
      } finally {
        setBusy(false);
      }
    },
    [currentStoryId, poll, serviceToken, serviceUrl],
  );

  const cancel = useCallback(async () => {
    if (!serviceUrl || !serviceToken || !status) {
      return;
    }
    await request(serviceUrl, serviceToken, `/v1/runs/${status.runId}/cancel`, { method: 'POST' }).catch(() => undefined);
  }, [serviceToken, serviceUrl, status]);

  const summary = useMemo(() => {
    if (error) {
      return `Error: ${error}`;
    }
    if (!status) {
      if (!configured) {
        return 'Waiting for the desktop test service (run `yarn desktop:service`)';
      }
      return available ? 'Ready' : 'Desktop test service announced but unreachable';
    }
    const failed = status.results.filter((result) => result.status !== 'passed' && result.status !== 'skipped');
    if (status.state === 'running') {
      return `Running… ${status.results.length} finished`;
    }
    return `${status.state}: ${status.results.length - failed.length} passed, ${failed.length} failed`;
  }, [available, configured, error, status]);

  const running = busy || status?.state === 'running';
  const disabled = !configured || !available || running;

  return (
    <View style={styles.root} testID="desktop-test-controls">
      <View style={styles.row}>
        <ControlButton
          label="Run current test"
          disabled={disabled || !currentStoryId}
          onPress={() => void start('current')}
          testID="desktop-test-run-current"
        />
        <ControlButton label="Run all tests" disabled={disabled} onPress={() => void start('all')} testID="desktop-test-run-all" />
        <ControlButton label="Cancel" disabled={!running} onPress={() => void cancel()} testID="desktop-test-cancel" />
      </View>
      <Text style={styles.summary} testID="desktop-test-status">
        {summary}
      </Text>
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
