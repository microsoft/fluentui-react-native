import os from 'node:os';

export type DesktopInterruptHandlers = {
  /** First interrupt: request a graceful stop that disposes every owned process and resource. */
  stop(signal: NodeJS.Signals): void;
  /** Second interrupt: force-kill owned process trees while cleanup continues. */
  terminate(signal: NodeJS.Signals): void;
};

const interruptSignals = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;

/**
 * Keeps interrupt handlers installed until the returned function is called, which must happen only after cleanup
 * completes: a signal that arrives during cleanup must not fall back to Node's default and kill the process mid-disposal.
 * A third interrupt exits immediately with the conventional 128 + signal status, leaving the workload claim behind for the
 * next run to inspect.
 */
export function handleDesktopInterrupts(handlers: DesktopInterruptHandlers): () => void {
  let received = 0;
  const listener = (signal: NodeJS.Signals) => {
    received++;
    if (received === 1) handlers.stop(signal);
    else if (received === 2) handlers.terminate(signal);
    else process.exit(128 + (os.constants.signals[signal] ?? os.constants.signals.SIGINT));
  };
  for (const signal of interruptSignals) process.on(signal, listener);
  return () => {
    for (const signal of interruptSignals) process.off(signal, listener);
  };
}
