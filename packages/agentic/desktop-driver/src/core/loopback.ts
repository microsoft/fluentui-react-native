export const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(['127.0.0.1', '::1', 'localhost']);

export function isLoopbackHost(host: unknown): host is string {
  return typeof host === 'string' && LOOPBACK_HOSTS.has(host);
}

/** Formats an IPv4, IPv6, or hostname value for use in an HTTP URL authority. */
export function hostForUrl(host: string): string {
  return host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
}
