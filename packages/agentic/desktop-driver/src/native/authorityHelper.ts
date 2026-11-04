// Client for a native helper's restricted one-shot authority modes, such as `--private-storage` and `--service-identity`.
// Each call runs one short-lived helper child that reads one JSON request on standard input and writes one JSON line, so
// none needs a Desktop Driver session. Callers own the meaning of the answer; this module owns only the bounded exchange.
import { spawn } from 'node:child_process';

import { NativeDriverError } from './NativeDriverError.js';
import { verifyNativeDriverArtifact } from './nativeDriver.js';
import type { NativeDriverArtifact, NativeDriverProvider } from './types.js';

export type AuthorityHelperMode = '--private-storage' | '--service-identity';

/** The helper's decoded answer. `ok` is true exactly when the helper exited with status 0. */
export type AuthorityAnswer = Readonly<Record<string, unknown> & { ok: boolean }>;

/** The helper's name in fixed error messages. */
export type AuthorityHelperName = 'macOS' | 'Windows';

const answerTimeoutMs = 10_000;
// The largest answer is one 16 KiB record as base64 plus a short envelope.
const maximumAnswerBytes = 64 * 1024;

const helperProviders: Readonly<Record<AuthorityHelperName, NativeDriverProvider>> = { macOS: 'macos', Windows: 'windows' };

/** Refuses an artifact for another provider, then verifies the helper's hash and handshake. */
export async function verifyAuthorityArtifact(artifact: NativeDriverArtifact, name: AuthorityHelperName): Promise<NativeDriverArtifact> {
  if (typeof artifact !== 'object' || artifact === null || artifact.provider !== helperProviders[name]) {
    throw new TypeError(`A ${name} native driver artifact is required.`);
  }
  return verifyNativeDriverArtifact(artifact);
}

/**
 * Sends one request and resolves the helper's answer. Rejects with a fixed, non-secret NativeDriverError when the helper
 * cannot run, times out, exceeds the answer bound, or answers outside the documented shape. The error never carries the
 * request, the output, or the helper's diagnostics, because those can hold grants or machine-local paths.
 */
export function runAuthorityHelper(
  name: AuthorityHelperName,
  artifact: Pick<NativeDriverArtifact, 'executablePath'>,
  mode: AuthorityHelperMode,
  request: unknown,
): Promise<AuthorityAnswer> {
  return new Promise((resolve, reject) => {
    const unavailable = () => new NativeDriverError('authority-helper-unavailable', `The ${name} authority helper did not answer.`);
    const body = JSON.stringify(request);
    let settled = false;
    let child: ReturnType<typeof spawn> | undefined;
    const finish = (settle: () => void): void => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        settle();
      }
    };
    const fail = (): void => {
      finish(() => {
        child?.kill();
        reject(unavailable());
      });
    };
    const timer = setTimeout(fail, answerTimeoutMs);

    try {
      child = spawn(artifact.executablePath, [mode], { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
    } catch {
      fail();
      return;
    }
    const output: Buffer[] = [];
    let received = 0;
    child.stdout?.on('data', (chunk: Buffer) => {
      received += chunk.length;
      if (received > maximumAnswerBytes) {
        fail();
      } else {
        output.push(chunk);
      }
    });
    child.once('error', fail);
    // A helper that exits before reading its request still answers; the exit decides the outcome.
    child.stdin?.on('error', () => undefined);
    child.once('close', (code) => {
      finish(() => {
        try {
          resolve(parseAnswer(Buffer.concat(output), code));
        } catch {
          reject(unavailable());
        }
      });
    });
    child.stdin?.end(body);
  });
}

/**
 * Resolves the answer to a request the helper accepted. A helper that cannot answer, or that refuses the request, throws
 * what `failure` builds from a closed reason token and never from the helper's own text.
 */
export async function requestAuthority(
  name: AuthorityHelperName,
  artifact: Pick<NativeDriverArtifact, 'executablePath'>,
  mode: AuthorityHelperMode,
  request: unknown,
  failure: (reason: string) => Error,
): Promise<AuthorityAnswer> {
  let answer: AuthorityAnswer;
  try {
    answer = await runAuthorityHelper(name, artifact, mode, request);
  } catch {
    throw failure('helper');
  }
  if (!answer.ok) {
    throw failure(refusalReason(answer.reason));
  }
  return answer;
}

/** An error with a fixed message. The reason is diagnostic only; it stays off enumeration, so logging the error cannot print it. */
export function failureWithReason(message: string, reason: string): Error {
  return Object.defineProperty(new Error(message), 'reason', { enumerable: false, value: reason });
}

// A closed lowercase token, so a diagnostic can never carry a path, a grant, or record contents.
function refusalReason(reason: unknown): string {
  return typeof reason === 'string' && /^[a-z]{1,16}$/.test(reason) ? reason : 'unknown';
}

function parseAnswer(output: Buffer, exitCode: number | null): AuthorityAnswer {
  const answer: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(output));
  if (typeof answer !== 'object' || answer === null || Array.isArray(answer)) {
    throw new Error();
  }
  const ok = (answer as { ok?: unknown }).ok;
  // The exit status and the answer must agree, so a truncated or substituted answer cannot read as success.
  if (typeof ok !== 'boolean' || (exitCode === 0) !== ok) {
    throw new Error();
  }
  return Object.freeze({ ...(answer as Record<string, unknown>), ok });
}
