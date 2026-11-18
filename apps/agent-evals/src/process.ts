import spawn from 'cross-spawn';
import { StringDecoder } from 'node:string_decoder';

export type CommandResult = {
  code: number | null;
  signal: string | null;
  timedOut: boolean;
  aborted: boolean;
  outputLimited: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
};

export async function runCommand(
  command: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv; timeoutMs: number; signal?: AbortSignal; maxOutputBytes?: number },
): Promise<CommandResult> {
  if (!Number.isSafeInteger(options.timeoutMs) || options.timeoutMs < 1) throw new Error('A positive command timeout is required.');
  const started = Date.now();
  const child = spawn(command, args, { cwd: options.cwd, env: options.env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let timedOut = false;
  let aborted = false;
  let outputLimited = false;
  let bytes = 0;
  let stdout = '';
  let stderr = '';
  const outputDecoder = new StringDecoder('utf8');
  const errorDecoder = new StringDecoder('utf8');
  let escalation: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    if (escalation || child.exitCode !== null || child.signalCode !== null) return;
    child.kill('SIGTERM');
    escalation = setTimeout(() => child.kill('SIGKILL'), 1000);
    escalation.unref();
  };
  const abort = () => {
    aborted = true;
    stop();
  };
  const timer = setTimeout(() => {
    timedOut = true;
    stop();
  }, options.timeoutMs);
  const collect = (chunk: Buffer, error: boolean) => {
    bytes += chunk.length;
    if (bytes > (options.maxOutputBytes ?? 16 * 1024 * 1024)) {
      outputLimited = true;
      stop();
      return;
    }
    if (error) stderr += errorDecoder.write(chunk);
    else stdout += outputDecoder.write(chunk);
  };
  child.stdout?.on('data', (chunk: Buffer) => collect(chunk, false));
  child.stderr?.on('data', (chunk: Buffer) => collect(chunk, true));
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) abort();
  try {
    const outcome = await new Promise<{ code: number | null; signal: string | null }>((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code, signal) => resolve({ code, signal }));
    });
    stdout += outputDecoder.end();
    stderr += errorDecoder.end();
    return { ...outcome, timedOut, aborted, outputLimited, stdout, stderr, durationMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
    clearTimeout(escalation);
    options.signal?.removeEventListener('abort', abort);
  }
}

export async function checkedCommand(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): Promise<string> {
  const result = await runCommand(command, args, { cwd, env, timeoutMs: 30_000 });
  if (result.code !== 0 || result.timedOut || result.aborted || result.outputLimited) {
    throw new Error(`${command} did not complete successfully (exit ${result.code}, timeout ${result.timedOut}).`);
  }
  return result.stdout.trim();
}
