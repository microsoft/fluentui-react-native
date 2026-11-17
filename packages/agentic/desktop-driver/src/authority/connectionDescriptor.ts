import { createHash } from 'node:crypto';
import path from 'node:path';

import { z } from 'zod';

import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import { assertPrivateRecordContents } from './privateStorage.js';
import type { PrivateStorage } from './privateStorage.js';

const identitySchema = z.strictObject({
  platform: z.enum(['macos', 'windows']),
  pid: z.number().int().positive().max(0x7fffffff),
  startedAt: z.string().min(1).max(128),
  executablePath: z.string().min(1).max(4096),
  interactiveSession: z.string().min(1).max(128),
  incarnation: z.string().regex(/^inc_[0-9a-f]{24}$/),
});
const descriptorSchema = z.strictObject({
  version: z.literal(1),
  url: z.string().max(128),
  service: identitySchema,
  grant: z.string().regex(/^fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}$/),
});
const bindingSchema = z.strictObject({
  digest: z.string().regex(/^[0-9a-f]{64}$/),
  incarnation: z.string().regex(/^inc_[0-9a-f]{24}$/),
  targetId: z.string().min(1).max(200),
  url: z.string().max(128).optional(),
});

export type DesktopServiceIdentity = Readonly<z.infer<typeof identitySchema>>;
export type DesktopConnectionDescriptor = Readonly<Omit<z.infer<typeof descriptorSchema>, 'service'>> & {
  readonly service: DesktopServiceIdentity;
};
/** Exact driver record, service generation, sole visible target, and optional listener expected by a containing supervisor. */
export type DesktopConnectionBinding = Readonly<z.infer<typeof bindingSchema>>;

/**
 * Must verify the live listener owner, exact process start/executable, current OS user, and interactive session.
 * It runs before any credential is transmitted. An unavailable native verifier must reject, never return true.
 */
export type VerifyDesktopService = (service: DesktopServiceIdentity, url: string) => Promise<boolean>;

export async function publishConnectionDescriptor(
  storage: PrivateStorage,
  name: string,
  descriptor: DesktopConnectionDescriptor,
): Promise<() => Promise<boolean>> {
  const contents = JSON.stringify(parseDescriptor(JSON.stringify(descriptor)));
  await storage.publish(name, contents);
  return () => storage.remove(name, contents);
}

/** Reads trusted discovery state and checks the live identity and authenticated incarnation before returning a grant. */
export async function readConnectionDescriptor(
  storage: PrivateStorage,
  name: string,
  verifyService: VerifyDesktopService,
  binding?: DesktopConnectionBinding,
  addSecret?: (secret: string) => void,
): Promise<DesktopConnectionDescriptor> {
  const expected = binding === undefined ? undefined : bindingSchema.safeParse(binding);
  if (expected && !expected.success) throw new TypeError('Invalid Desktop Driver connection binding.');
  const contents = await storage.read(name);
  if (contents === undefined) throw new Error('The Desktop Driver connection descriptor is absent.');
  const descriptor = parseDescriptor(contents);
  if (
    expected?.success &&
    (createHash('sha256').update(contents, 'utf8').digest('hex') !== expected.data.digest ||
      descriptor.service.incarnation !== expected.data.incarnation ||
      (expected.data.url !== undefined && descriptor.url !== expected.data.url))
  ) {
    throw new Error('The Desktop Driver connection does not match its supervisor binding.');
  }
  if (typeof verifyService !== 'function' || (await verifyService(descriptor.service, descriptor.url)) !== true) {
    throw new Error('The Desktop Driver service identity could not be verified.');
  }
  addSecret?.(descriptor.grant);
  const status = await createDesktopDriverClient({
    grant: descriptor.grant,
    url: descriptor.url,
    fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }),
  }).status();
  if (
    typeof status.service !== 'object' ||
    status.service === null ||
    !('incarnation' in status.service) ||
    status.service.incarnation !== descriptor.service.incarnation
  ) {
    throw new Error('The Desktop Driver service incarnation changed.');
  }
  if (
    expected?.success &&
    (status.ready !== true ||
      !Array.isArray(status.targets) ||
      status.targets.length !== 1 ||
      typeof status.targets[0] !== 'object' ||
      status.targets[0] === null ||
      status.targets[0].id !== expected.data.targetId)
  ) {
    throw new Error('The Desktop Driver target does not match its supervisor binding.');
  }
  return descriptor;
}

function parseDescriptor(contents: string): DesktopConnectionDescriptor {
  try {
    assertPrivateRecordContents(contents);
    const descriptor = descriptorSchema.parse(JSON.parse(contents));
    const url = new URL(descriptor.url);
    if (
      url.protocol !== 'http:' ||
      !['127.0.0.1', '[::1]'].includes(url.hostname) ||
      !url.port ||
      url.username ||
      url.password ||
      descriptor.url !== url.origin
    ) {
      throw new Error();
    }
    const executablePath = descriptor.service.executablePath;
    const isAbsolute =
      descriptor.service.platform === 'macos' ? path.posix.isAbsolute(executablePath) : path.win32.isAbsolute(executablePath);
    if (!isAbsolute || /\p{Cc}/u.test(executablePath)) throw new Error();
    return Object.freeze({ ...descriptor, service: Object.freeze(descriptor.service) });
  } catch {
    // Parser diagnostics can contain the plaintext grant or machine-local identity fields.
    throw new TypeError('Invalid Desktop Driver connection descriptor.');
  }
}
