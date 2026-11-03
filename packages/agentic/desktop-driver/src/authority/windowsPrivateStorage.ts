// Owner-only private storage on Windows, backed by the Windows helper's `--private-storage` mode. From open handles the
// helper checks the current owner, the protected DACL of the root and of every record, the DACLs of the ancestors, reparse
// points, hard links, and the volume, and it publishes a record without replacing one. This module keeps the root identity
// the helper reported first and sends it back with every call, so a replaced root is never trusted.
import path from 'node:path';

import { z } from 'zod';

import type { NativeDriverArtifact } from '../native/types.js';
import { failureWithReason, requestWindowsAuthority, verifyWindowsAuthorityArtifact } from '../native/windows/authorityHelper.js';
import { assertPrivateRecordContents, assertPrivateRecordName, privateRecordMaxBytes } from './privateStorage.js';
import type { PrivateStorage } from './privateStorage.js';

export type WindowsPrivateStorageOptions = {
  /** The Windows helper that enforces ownership. It is verified when the storage opens. */
  artifact: NativeDriverArtifact;
  /**
   * A canonical absolute local-drive path. Omitted, the helper uses a per-user folder under the local application data
   * folder. The parent must already exist. Existing roots are validated, never repaired.
   */
  root?: string;
};

const encodedRecordMaxLength = Math.ceil(privateRecordMaxBytes / 3) * 4;
const rootIdentity = z.strictObject({ file: z.string().regex(/^[0-9a-f]{32}$/), volume: z.string().regex(/^[0-9a-f]{16}$/) });
const openedAnswer = z.strictObject({ identity: rootIdentity, ok: z.literal(true), root: z.string().max(4096) });
const acceptedAnswer = z.strictObject({ ok: z.literal(true) });
const readAnswer = z.strictObject({ contents: z.string().max(encodedRecordMaxLength).optional(), found: z.boolean(), ok: z.literal(true) });
const removedAnswer = z.strictObject({ ok: z.literal(true), removed: z.boolean() });

const unsafeStorage = (reason: string): Error => failureWithReason('Desktop Driver private storage is unsafe or inaccessible.', reason);
const publicationFailed = (reason: string): Error =>
  failureWithReason('Private record publication failed; unsafe storage or an existing record cannot be replaced.', reason);

/**
 * Opens the Windows owner-only state root through the Windows helper. The parent must already exist. Existing roots are
 * validated, never repaired. Failures carry a fixed message and a non-enumerable `reason` for diagnostics only.
 */
export async function createWindowsPrivateStorage(options: WindowsPrivateStorageOptions): Promise<PrivateStorage> {
  if (process.platform !== 'win32') {
    throw new Error('Windows private storage is unsupported on this platform; use a validated native ownership adapter.');
  }
  if (typeof options !== 'object' || options === null) {
    throw new TypeError('Windows private storage requires options that name a native driver artifact.');
  }
  if (options.root !== undefined && !isCanonicalRoot(options.root)) {
    throw new TypeError('Private storage requires a canonical absolute root path.');
  }
  const artifact = await verifyWindowsAuthorityArtifact(options.artifact);

  const opened = openedAnswer.safeParse(
    await requestWindowsAuthority(
      artifact,
      '--private-storage',
      options.root === undefined ? { operation: 'open' } : { operation: 'open', root: options.root },
      unsafeStorage,
    ),
  );
  if (!opened.success || (options.root !== undefined && opened.data.root !== options.root) || !isCanonicalRoot(opened.data.root)) {
    throw unsafeStorage('helper');
  }
  const { identity, root } = opened.data;

  // Every call names the root and the identity from the first open; the helper refuses any other directory.
  async function call<Schema extends z.ZodType>(
    request: Record<string, unknown>,
    schema: Schema,
    failure: (reason: string) => Error,
  ): Promise<z.infer<Schema>> {
    const answer = await requestWindowsAuthority(artifact, '--private-storage', { ...request, identity, root }, failure);
    const parsed = schema.safeParse(answer);
    if (!parsed.success) {
      throw failure('helper');
    }
    return parsed.data;
  }

  return {
    async read(name) {
      assertPrivateRecordName(name);
      const answer = await call({ name, operation: 'read' }, readAnswer, unsafeStorage);
      if (!answer.found) {
        if (answer.contents !== undefined) throw unsafeStorage('helper');
        return undefined;
      }
      if (answer.contents === undefined) throw unsafeStorage('helper');
      try {
        return decodeRecord(answer.contents);
      } catch {
        throw unsafeStorage('helper');
      }
    },
    async publish(name, contents) {
      assertPrivateRecordName(name);
      assertPrivateRecordContents(contents);
      await call({ contents: encodeRecord(contents), name, operation: 'publish' }, acceptedAnswer, publicationFailed);
    },
    async remove(name, expectedContents) {
      assertPrivateRecordName(name);
      assertPrivateRecordContents(expectedContents);
      const answer = await call({ expected: encodeRecord(expectedContents), name, operation: 'remove' }, removedAnswer, unsafeStorage);
      return answer.removed;
    },
  };
}

function isCanonicalRoot(root: unknown): root is string {
  return typeof root === 'string' && /^[A-Za-z]:\\/.test(root) && path.win32.resolve(root) === root && !/\p{Cc}/u.test(root);
}

function encodeRecord(contents: string): string {
  return Buffer.from(contents, 'utf8').toString('base64');
}

function decodeRecord(encoded: string): string {
  const bytes = Buffer.from(encoded, 'base64');
  // Buffer's decoder skips what is not base64, so only the canonical form the helper writes survives the round trip.
  if (bytes.toString('base64') !== encoded || bytes.length > privateRecordMaxBytes) {
    throw new Error();
  }
  // A leading byte order mark belongs to the record, so it is kept for an exact round trip.
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
}
