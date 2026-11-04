// The Windows helper's restricted authority modes, `--private-storage` and `--service-identity`, over the shared one-shot
// helper client.
import { requestAuthority, runAuthorityHelper, verifyAuthorityArtifact } from '../authorityHelper.js';
import type { AuthorityAnswer, AuthorityHelperMode } from '../authorityHelper.js';
import type { NativeDriverArtifact } from '../types.js';

export type WindowsAuthorityMode = AuthorityHelperMode;

/** The helper's decoded answer. `ok` is true exactly when the helper exited with status 0. */
export type WindowsAuthorityAnswer = AuthorityAnswer;

/** Refuses an artifact for another provider, then verifies the helper's hash and handshake. */
export function verifyWindowsAuthorityArtifact(artifact: NativeDriverArtifact): Promise<NativeDriverArtifact> {
  return verifyAuthorityArtifact(artifact, 'Windows');
}

/** Sends one request to the Windows helper; see `runAuthorityHelper`. */
export function runWindowsAuthorityHelper(
  artifact: Pick<NativeDriverArtifact, 'executablePath'>,
  mode: WindowsAuthorityMode,
  request: unknown,
): Promise<WindowsAuthorityAnswer> {
  return runAuthorityHelper('Windows', artifact, mode, request);
}

/** Resolves the Windows helper's answer to an accepted request; see `requestAuthority`. */
export function requestWindowsAuthority(
  artifact: Pick<NativeDriverArtifact, 'executablePath'>,
  mode: WindowsAuthorityMode,
  request: unknown,
  failure: (reason: string) => Error,
): Promise<WindowsAuthorityAnswer> {
  return requestAuthority('Windows', artifact, mode, request, failure);
}
