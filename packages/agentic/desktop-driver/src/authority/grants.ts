import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Grants are `fdg1.<id>.<secret>`. The id names the grant in ownership records; only the secret authenticates. */
const tokenScheme = 'fdg1';
const labelPattern = /^[A-Za-z0-9._:-]{1,32}$/;
const maxAuthorizationLength = 512;
const maxTargetIdLength = 200;

/** The registered target ids a grant may open and drive, or `*` for every target the service registers. */
export type GrantTargets = '*' | readonly string[];

export type GrantRequest = {
  /**
   * A short, non-secret name for whoever holds the grant. Other callers see it when they contend for the same target,
   * so it must say what the holder is (`agent`, `wdio`), never who or where.
   */
  label: string;
  targets: GrantTargets;
};

/** What the service knows about an authenticated caller. It never contains the secret. */
export type DesktopGrant = {
  readonly id: string;
  readonly label: string;
  readonly targets: GrantTargets;
};

/** A new grant with its bearer token. The token is returned once and cannot be recovered from the authority. */
export type IssuedDesktopGrant = DesktopGrant & { readonly token: string };

type StoredGrant = { digest: Buffer; grant: DesktopGrant };

/**
 * The credential authority of one service incarnation. A service that has an authority requires a grant for every
 * request, so a protected target cannot be reached through an alternate route or a legacy client. Grants die with the
 * incarnation; a restarted service issues new ones and never honors old ones.
 *
 * The authority stores a digest of each secret, so a heap snapshot or an accidental serialization of the authority does
 * not leak a usable credential. The boundary it enforces is other operating-system accounts and accidental cross-client
 * access, not mutually hostile processes of the same account.
 */
export class DesktopAuthority {
  /** Identifies this service start. A reconnecting client must find the same value or the service restarted. */
  readonly incarnation = `inc_${randomBytes(12).toString('hex')}`;
  private readonly grants = new Map<string, StoredGrant>();
  private readonly revocationListeners = new Set<(grant: DesktopGrant) => void>();
  // Verifying a token for an unknown grant compares against this so the two failures take the same work.
  private readonly unknownDigest = digestOf(randomBytes(32).toString('base64url'));

  issue(request: GrantRequest): IssuedDesktopGrant {
    const label = request.label;
    if (typeof label !== 'string' || !labelPattern.test(label)) {
      throw new TypeError('A grant label must be 1-32 characters of letters, digits, ".", "_", ":" or "-".');
    }
    const targets = normalizeTargets(request.targets);
    const id = randomBytes(16).toString('hex');
    const secret = randomBytes(32).toString('base64url');
    const grant: DesktopGrant = Object.freeze({ id, label, targets });
    this.grants.set(id, { digest: digestOf(secret), grant });
    return Object.freeze({ ...grant, token: `${tokenScheme}.${id}.${secret}` });
  }

  /** Returns the grant behind an `Authorization: Bearer` value, or undefined for anything else. Never throws. */
  authenticate(authorization: string | undefined): DesktopGrant | undefined {
    if (typeof authorization !== 'string' || authorization.length > maxAuthorizationLength) {
      return undefined;
    }
    if (authorization.slice(0, 7).toLowerCase() !== 'bearer ') {
      return undefined;
    }
    const parts = authorization.slice(7).split('.');
    if (parts.length !== 3 || parts[0] !== tokenScheme) {
      return undefined;
    }
    const stored = this.grants.get(parts[1]);
    const matches = timingSafeEqual(digestOf(parts[2]), stored?.digest ?? this.unknownDigest);
    return stored && matches ? stored.grant : undefined;
  }

  /** Invalidates a grant. Sessions it owns are reported to listeners so the service can drain them. */
  revoke(grantId: string): boolean {
    const stored = this.grants.get(grantId);
    if (!stored) {
      return false;
    }
    this.grants.delete(grantId);
    for (const listener of this.revocationListeners) {
      listener(stored.grant);
    }
    return true;
  }

  onRevoke(listener: (grant: DesktopGrant) => void): () => void {
    this.revocationListeners.add(listener);
    return () => this.revocationListeners.delete(listener);
  }

  /** Fails fast when a grant names a target the service does not register, so a typo cannot silently grant nothing. */
  assertTargetsRegistered(registeredIds: ReadonlySet<string>): void {
    for (const { grant } of this.grants.values()) {
      if (grant.targets === '*') {
        continue;
      }
      for (const targetId of grant.targets) {
        if (!registeredIds.has(targetId)) {
          throw new Error(`Grant "${grant.label}" names target "${targetId}", which this service does not register.`);
        }
      }
    }
  }
}

export function grantAllowsTarget(grant: DesktopGrant, targetId: string): boolean {
  return grant.targets === '*' || grant.targets.includes(targetId);
}

function normalizeTargets(targets: GrantTargets): GrantTargets {
  if (targets === '*') {
    return '*';
  }
  if (!Array.isArray(targets) || targets.length === 0) {
    throw new TypeError('A grant needs "*" or a non-empty list of target ids.');
  }
  for (const targetId of targets) {
    if (typeof targetId !== 'string' || targetId.length === 0 || targetId.length > maxTargetIdLength) {
      throw new TypeError('Grant target ids must be non-empty strings of at most 200 characters.');
    }
  }
  return Object.freeze([...new Set(targets)]);
}

function digestOf(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}
