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

export type DesktopServiceIdentity = Readonly<z.infer<typeof identitySchema>>;
export type DesktopConnectionDescriptor = Readonly<Omit<z.infer<typeof descriptorSchema>, 'service'>> & {
  readonly service: DesktopServiceIdentity;
};

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
): Promise<DesktopConnectionDescriptor> {
  const contents = await storage.read(name);
  if (contents === undefined) throw new Error('The Desktop Driver connection descriptor is absent.');
  const descriptor = parseDescriptor(contents);
  if (typeof verifyService !== 'function' || (await verifyService(descriptor.service, descriptor.url)) !== true) {
    throw new Error('The Desktop Driver service identity could not be verified.');
  }
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
