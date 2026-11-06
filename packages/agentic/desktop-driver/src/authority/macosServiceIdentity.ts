// macOS service identity for the Desktop Driver connection descriptor, backed by the macOS helper's `--service-identity`
// mode. `describeMacOSService` reports the identity a supervisor publishes for itself, and `createMacOSServiceVerifier`
// checks a descriptor's claim against the live process and the current user's loopback listeners before any credential is
// sent. A macOS identity is never comparable with a Windows identity.
import path from 'node:path';

import { z } from 'zod';

import { failureWithReason, requestAuthority, runAuthorityHelper, verifyAuthorityArtifact } from '../native/authorityHelper.js';
import type { AuthorityAnswer } from '../native/authorityHelper.js';
import type { NativeDriverArtifact } from '../native/types.js';
import type { DesktopServiceIdentity, VerifyDesktopService } from './connectionDescriptor.js';

export type DescribeMacOSServiceOptions = {
  /** The macOS helper that inspects the process. It is verified before the process is described. */
  artifact: NativeDriverArtifact;
  /** The process id of the running service. */
  pid: number;
};

export type MacOSServiceVerifierOptions = {
  /** The macOS helper that verifies a claim. It is verified on first use. */
  artifact: NativeDriverArtifact;
};

const maximumProcessId = 0x7fffffff;

const describedAnswer = z.strictObject({
  identity: z.strictObject({
    executablePath: z.string().min(1).max(4096),
    interactiveSession: z.string().regex(/^macos-session:[0-9]{1,10}$/),
    pid: z.number().int().positive().max(maximumProcessId),
    platform: z.literal('macos'),
    startedAt: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$/),
  }),
  ok: z.literal(true),
});

const undescribed = (reason: string): Error => failureWithReason('The macOS service identity could not be determined.', reason);
const unavailable = (reason: string): Error => failureWithReason('The macOS Desktop Driver service verifier is unavailable.', reason);

/**
 * Describes a running process of the current user in the current audit session as a macOS identity without an
 * incarnation, which the supervisor adds. Refuses another user's or session's process and a process that has exited.
 * Failures carry a fixed message and a non-enumerable `reason` for diagnostics only.
 */
export async function describeMacOSService(options: DescribeMacOSServiceOptions): Promise<Omit<DesktopServiceIdentity, 'incarnation'>> {
  refuseOtherPlatforms('macOS service identity');
  if (typeof options !== 'object' || options === null) {
    throw new TypeError('macOS service identity requires options that name a native driver artifact and a process id.');
  }
  const { pid } = options;
  if (!Number.isSafeInteger(pid) || pid < 1 || pid > maximumProcessId) {
    throw new TypeError('A service process id must be a positive 31-bit integer.');
  }
  const artifact = await verifyAuthorityArtifact(options.artifact, 'macOS');
  const described = describedAnswer.safeParse(
    await requestAuthority('macOS', artifact, '--service-identity', { operation: 'describe', pid }, undescribed),
  );
  if (!described.success || described.data.identity.pid !== pid || !isMacOSExecutablePath(described.data.identity.executablePath)) {
    throw undescribed('helper');
  }
  return Object.freeze({ ...described.data.identity });
}

/**
 * Verifies the exact process start time and executable, the current user, the audit session, and that the claimed
 * process alone serves the loopback address without SO_REUSEPORT before a credential is sent. Resolves true only when the
 * helper verified the claim. A claim that is not a macOS identity, or that the helper refuses, resolves false. A helper
 * that cannot answer rejects, never resolves true.
 */
export function createMacOSServiceVerifier(options: MacOSServiceVerifierOptions): VerifyDesktopService {
  refuseOtherPlatforms('macOS service verification');
  if (typeof options !== 'object' || options === null || typeof options.artifact !== 'object' || options.artifact?.provider !== 'macos') {
    throw new TypeError('A macOS native driver artifact is required.');
  }
  const { artifact } = options;

  // The helper is verified on first use; a failed verification is retried by the next call.
  let verified: Promise<NativeDriverArtifact> | undefined;
  const verifiedHelper = (): Promise<NativeDriverArtifact> => {
    const attempt = (verified ??= verifyAuthorityArtifact(artifact, 'macOS'));
    attempt.catch(() => {
      if (verified === attempt) verified = undefined;
    });
    return attempt;
  };

  return async (service, url) => {
    if (!isMacOSClaim(service) || typeof url !== 'string') {
      return false;
    }
    const helper = await verifiedHelper();
    let answer: AuthorityAnswer;
    try {
      answer = await runAuthorityHelper('macOS', helper, '--service-identity', {
        operation: 'verify',
        service: {
          executablePath: service.executablePath,
          incarnation: service.incarnation,
          interactiveSession: service.interactiveSession,
          pid: service.pid,
          platform: service.platform,
          startedAt: service.startedAt,
        },
        url,
      });
    } catch {
      throw unavailable('helper');
    }
    return interpretVerdict(answer);
  };
}

function interpretVerdict(answer: AuthorityAnswer): boolean {
  if (answer.ok) {
    if (answer.verified === true && Object.keys(answer).length === 2) return true;
    if (answer.verified === false) return false;
  } else if (answer.reason === 'request') {
    // The helper could not read the claim as a claim, so nothing was verified.
    return false;
  }
  throw unavailable('helper');
}

function isMacOSClaim(service: DesktopServiceIdentity): boolean {
  return (
    typeof service === 'object' &&
    service !== null &&
    service.platform === 'macos' &&
    Number.isSafeInteger(service.pid) &&
    [service.executablePath, service.incarnation, service.interactiveSession, service.startedAt].every((field) => typeof field === 'string')
  );
}

function isMacOSExecutablePath(executablePath: string): boolean {
  return path.posix.isAbsolute(executablePath) && !/\p{Cc}/u.test(executablePath);
}

function refuseOtherPlatforms(subject: string): void {
  if (process.platform !== 'darwin') {
    throw new Error(`${subject} is unsupported on this platform; use a validated native ownership adapter.`);
  }
}
