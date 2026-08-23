import { DesktopDriverError } from '../errors.ts';

/** Environment variable through which the launcher publishes the owned endpoint to workers. */
export const DESKTOP_ENDPOINT_ENV = 'FURN_DESKTOP_DRIVER_ENDPOINT';

export interface PublishedEndpoint {
  hostname: string;
  port: number;
  path: string;
  storybookUrl?: string;
  runId: string;
  artifactsDirectory: string;
  driverHostLog?: string;
  driverHostPid?: number;
  appProcessId?: number;
  specDigest?: string;
  windowHandle?: string;
  windowMatch?: { matchedBy: string; exact: boolean; name?: string; processId?: number };
  error?: string;
}

export function publishEndpoint(endpoint: PublishedEndpoint): void {
  process.env[DESKTOP_ENDPOINT_ENV] = JSON.stringify(endpoint);
}

export function clearPublishedEndpoint(): void {
  delete process.env[DESKTOP_ENDPOINT_ENV];
}

export function readPublishedEndpoint(): PublishedEndpoint {
  const raw = process.env[DESKTOP_ENDPOINT_ENV];
  if (!raw) {
    throw new DesktopDriverError('The desktop driver launcher did not publish an endpoint; is the service registered in `services`?', {
      kind: 'configuration',
    });
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new DesktopDriverError('The desktop driver launcher published malformed endpoint JSON', {
      kind: 'configuration',
      cause: error,
    });
  }
  if (typeof value !== 'object' || value === null) {
    throw new DesktopDriverError('The desktop driver launcher published an invalid endpoint', { kind: 'configuration' });
  }
  const endpoint = value as Partial<PublishedEndpoint>;
  if (
    typeof endpoint.runId !== 'string' ||
    typeof endpoint.artifactsDirectory !== 'string' ||
    (endpoint.error === undefined &&
      (typeof endpoint.hostname !== 'string' || !Number.isInteger(endpoint.port) || typeof endpoint.path !== 'string'))
  ) {
    throw new DesktopDriverError('The desktop driver launcher published an incomplete endpoint', {
      kind: 'configuration',
      detail: { runId: endpoint.runId },
    });
  }
  if (endpoint.error) {
    throw new DesktopDriverError(`The desktop driver host failed to start: ${endpoint.error}`, {
      kind: 'driverHost',
      detail: { runId: endpoint.runId },
    });
  }
  return endpoint as PublishedEndpoint;
}
