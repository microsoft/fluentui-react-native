// Windows application incarnation probe for settlement recovery, backed by the Windows helper's `--application-incarnation`
// mode. A quarantine records the process id and start time of the application it was raised against; the probe answers
// `exited` only when the helper proves that exact process no longer runs.
import { z } from 'zod';

import { failureWithReason } from '../native/authorityHelper.js';
import type { NativeDriverArtifact } from '../native/types.js';
import { runWindowsAuthorityHelper, verifyWindowsAuthorityArtifact } from '../native/windows/authorityHelper.js';
import type { WindowsAuthorityAnswer } from '../native/windows/authorityHelper.js';
import type { ApplicationState, ProbeApplication } from '../server/settlementJournal.js';

export type WindowsApplicationProbeOptions = {
  /** The Windows helper that inspects the process. It is verified on first use. */
  artifact: NativeDriverArtifact;
};

const maximumProcessId = 0x7fffffff;
const answered = z.strictObject({ ok: z.literal(true), state: z.enum(['exited', 'running', 'unknown']) });
const unavailable = (reason: string): Error => failureWithReason('The Windows application probe is unavailable.', reason);

/**
 * Creates the `probeApplication` a supervisor passes to `createDesktopDriverServer({ recovery })` on Windows. Resolves
 * `unknown` for an incarnation it cannot ask about and rejects when the helper cannot answer, which the service treats as
 * `unknown` too, so only the helper's proof ever lifts a quarantine.
 */
export function createWindowsApplicationProbe(options: WindowsApplicationProbeOptions): ProbeApplication {
  if (process.platform !== 'win32') {
    throw new Error('The Windows application probe is unsupported on this platform; use a validated native ownership adapter.');
  }
  if (typeof options !== 'object' || options === null || typeof options.artifact !== 'object' || options.artifact?.provider !== 'windows') {
    throw new TypeError('A Windows native driver artifact is required.');
  }
  const { artifact } = options;

  // The helper is verified on first use; a failed verification is retried by the next call.
  let verified: Promise<NativeDriverArtifact> | undefined;
  const verifiedHelper = (): Promise<NativeDriverArtifact> => {
    const attempt = (verified ??= verifyWindowsAuthorityArtifact(artifact));
    attempt.catch(() => {
      if (verified === attempt) verified = undefined;
    });
    return attempt;
  };

  return async (application): Promise<ApplicationState> => {
    const { processId, processStartedAt } = application ?? {};
    if (
      !Number.isSafeInteger(processId) ||
      processId < 1 ||
      processId > maximumProcessId ||
      typeof processStartedAt !== 'string' ||
      processStartedAt.length === 0 ||
      processStartedAt.length > 64
    ) {
      return 'unknown';
    }
    const helper = await verifiedHelper();
    let answer: WindowsAuthorityAnswer;
    try {
      answer = await runWindowsAuthorityHelper(helper, '--application-incarnation', { pid: processId, startedAt: processStartedAt });
    } catch {
      throw unavailable('helper');
    }
    const parsed = answered.safeParse(answer);
    if (parsed.success) {
      return parsed.data.state;
    }
    if (answer.ok === false && answer.reason === 'request') {
      // The helper could not read the recorded incarnation, so nothing was proven.
      return 'unknown';
    }
    throw unavailable('helper');
  };
}
