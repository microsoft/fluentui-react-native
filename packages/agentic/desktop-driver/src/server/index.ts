import { toDesktopHostOptions, type ResolvedDesktopProject } from '../config/node.ts';

import { startDesktopStorybookHost } from './host.ts';

export type DesktopHostState = 'starting' | 'ready' | 'draining' | 'stopped' | 'failed';

export interface DesktopHostExit {
  state: 'stopped' | 'failed';
  error?: Error;
}

export interface DesktopHostHandle {
  readonly id: string;
  readonly url: URL;
  readonly state: DesktopHostState;
  readonly manifestDigest: string;
  readonly closed: Promise<DesktopHostExit>;
  stop(options?: { reason?: 'signal' | 'sentinel' | 'programmatic'; timeoutMs?: number }): Promise<void>;
}

export interface StartDesktopHostOptions {
  project: ResolvedDesktopProject;
  signal?: AbortSignal;
  onOutput?: (chunk: string) => void;
}

/** Starts the config-driven Storybook channel, MCP endpoint, and desktop run coordinator. */
export async function startDesktopHost(options: StartDesktopHostOptions): Promise<DesktopHostHandle> {
  let state: DesktopHostState = 'starting';
  let resolveClosed!: (exit: DesktopHostExit) => void;
  const closed = new Promise<DesktopHostExit>((resolve) => {
    resolveClosed = resolve;
  });
  const host = await startDesktopStorybookHost({
    ...toDesktopHostOptions(options.project),
    onOutput: options.onOutput,
  });
  state = 'ready';
  let stopping: Promise<void> | undefined;
  const stop = (stopOptions: { reason?: 'signal' | 'sentinel' | 'programmatic'; timeoutMs?: number } = {}): Promise<void> => {
    if (stopping) {
      return stopping;
    }
    state = 'draining';
    const cleanup = host.stop();
    const bounded =
      stopOptions.timeoutMs === undefined
        ? cleanup
        : Promise.race([
            cleanup,
            new Promise<never>((_, reject) => {
              const timer = setTimeout(
                () =>
                  reject(new Error(`Desktop host shutdown exceeded ${stopOptions.timeoutMs}ms (${stopOptions.reason ?? 'programmatic'})`)),
                stopOptions.timeoutMs,
              );
              timer.unref();
              void cleanup.then(
                () => clearTimeout(timer),
                () => clearTimeout(timer),
              );
            }),
          ]);
    stopping = bounded.then(
      () => {
        state = 'stopped';
        resolveClosed({ state: 'stopped' });
      },
      (error: unknown) => {
        state = 'failed';
        const failure = error instanceof Error ? error : new Error(String(error));
        resolveClosed({ state: 'failed', error: failure });
        throw failure;
      },
    );
    return stopping;
  };
  if (options.signal?.aborted) {
    void stop({ reason: 'signal' });
  } else {
    options.signal?.addEventListener('abort', () => void stop({ reason: 'signal' }), { once: true });
  }

  return {
    id: host.serviceId,
    url: new URL(host.url),
    get state() {
      return state;
    },
    manifestDigest: host.manifest.digest,
    closed,
    stop,
  };
}
