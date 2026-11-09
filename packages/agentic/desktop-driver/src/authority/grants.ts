import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Grants are `fdg1.<id>.<secret>`. The id names the grant in ownership records; only the secret authenticates. */
const tokenScheme = 'fdg1';
const labelPattern = /^[A-Za-z0-9._:-]{1,32}$/;
const maxAuthorizationLength = 512;
const maxTargetIdLength = 200;

/** The registered target ids a grant may open and drive, or `*` for every target the service registers. */
export type GrantTargets = '*' | readonly string[];
export type GrantScope = 'driver-control' | 'declared-workload' | 'operator-recovery';

export type GrantRequest = {
  /**
   * A short, non-secret name for whoever holds the grant. Other callers see it when they contend for the same target,
   * so it must say what the holder is (`agent`, `wdio`), never who or where.
   */
  label: string;
  targets: GrantTargets;
  scopes?: readonly GrantScope[];
};

/** What the service knows about an authenticated caller. It never contains the secret. */
export type DesktopGrant = {
  readonly id: string;
  readonly label: string;
  readonly targets: GrantTargets;
  readonly scopes: readonly GrantScope[];
  readonly parentId?: string;
};

/** A new grant with its bearer token. The token is returned once and cannot be recovered from the authority. */
export type IssuedDesktopGrant = DesktopGrant & { readonly token: string };

type StoredGrant = { digest: Buffer; grant: DesktopGrant; depth: number };
type Drain = { pending: Promise<void>; failed: boolean; failureReported: boolean };
const maxGrants = 4096;
const maxDepth = 8;

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
  private readonly revocationListeners = new Set<(grant: DesktopGrant) => unknown>();
  private readonly drains = new Map<string, Drain>();
  private readonly revoked = new Map<string, StoredGrant>();
  private issuedCount = 0;
  // Verifying a token for an unknown grant compares against this so the two failures take the same work.
  private readonly unknownDigest = digestOf(randomBytes(32).toString('base64url'));

  issue(request: GrantRequest): IssuedDesktopGrant {
    return this.create(request, undefined);
  }

  /** Trusted callers may attenuate targets and permissions, never expand them. */
  delegate(parentId: string, request: GrantRequest): IssuedDesktopGrant {
    const parent = this.grants.get(parentId);
    if (!parent || parent.depth >= maxDepth) throw new TypeError('Grant delegation is unavailable.');
    const targets = normalizeTargets(request.targets);
    const scopes = normalizeScopes(request.scopes ?? parent.grant.scopes);
    if (
      (targets === '*' ? parent.grant.targets !== '*' : targets.some((id) => !grantAllowsTarget(parent.grant, id))) ||
      scopes.some((scope) => !parent.grant.scopes.includes(scope))
    ) {
      throw new TypeError('A child grant cannot exceed its parent authority.');
    }
    return this.create({ ...request, scopes, targets }, parent);
  }

  private create(request: GrantRequest, parent: StoredGrant | undefined): IssuedDesktopGrant {
    if (this.issuedCount >= maxGrants) throw new RangeError('The service grant limit has been reached.');
    const label = request.label;
    if (typeof label !== 'string' || !labelPattern.test(label)) {
      throw new TypeError('A grant label must be 1-32 characters of letters, digits, ".", "_", ":" or "-".');
    }
    const targets = normalizeTargets(request.targets);
    const scopes = normalizeScopes(request.scopes);
    const id = randomBytes(16).toString('hex');
    const secret = randomBytes(32).toString('base64url');
    const grant: DesktopGrant = Object.freeze({ id, label, targets, scopes, ...(parent ? { parentId: parent.grant.id } : {}) });
    this.grants.set(id, { digest: digestOf(secret), grant, depth: parent ? parent.depth + 1 : 0 });
    this.issuedCount += 1;
    return Object.freeze({ ...grant, token: `${tokenScheme}.${id}.${secret}` });
  }

  /** Returns the grant behind an `Authorization: Bearer` value, or undefined for anything else. Never throws. */
  authenticate(authorization: string | undefined): DesktopGrant | undefined {
    return this.authenticateFrom(authorization, this.grants);
  }

  /** Terminal proof is accepted only by the child's own cleanup route, never ordinary authentication. */
  authenticateRevocation(authorization: string | undefined): DesktopGrant | undefined {
    const grant = this.authenticateFrom(authorization, this.revoked);
    return grant?.parentId ? grant : undefined;
  }

  private authenticateFrom(authorization: string | undefined, records: ReadonlyMap<string, StoredGrant>): DesktopGrant | undefined {
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
    const stored = records.get(parts[1]);
    const matches = timingSafeEqual(digestOf(parts[2]), stored?.digest ?? this.unknownDigest);
    return stored && matches ? stored.grant : undefined;
  }

  /** Invalidates a grant immediately. Use revokeAndDrain to await session cleanup and observe failures. */
  revoke(grantId: string): boolean {
    const stored = this.grants.get(grantId);
    if (!stored) {
      return false;
    }
    const subtree = this.subtree(stored);
    for (const item of subtree) {
      this.grants.delete(item.grant.id);
      this.revoked.set(item.grant.id, item);
    }
    for (const item of subtree) {
      if (!this.drains.has(item.grant.id)) this.startDrain(item);
    }
    return true;
  }

  private subtree(root: StoredGrant): StoredGrant[] {
    const records = [...this.grants.values(), ...this.revoked.values()];
    return records.filter((candidate) => {
      let current: StoredGrant | undefined = candidate;
      while (current) {
        if (current === root) return true;
        const parentId = current.grant.parentId ?? '';
        current = this.grants.get(parentId) ?? this.revoked.get(parentId);
      }
      return false;
    });
  }

  private startDrain({ grant }: StoredGrant): Drain {
    let resolve!: () => void;
    let reject!: (reason: unknown) => void;
    const drain: Drain = {
      pending: new Promise<void>((complete, fail) => {
        resolve = complete;
        reject = fail;
      }),
      failed: false,
      failureReported: false,
    };
    this.drains.set(grant.id, drain);
    // Install the barrier before calling listeners, which may themselves revoke another branch.
    void drain.pending.catch(() => undefined);
    const pending = [...this.revocationListeners].map((listener) => {
      try {
        return Promise.resolve(listener(grant));
      } catch (error) {
        return Promise.reject(error);
      }
    });
    void Promise.allSettled(pending).then((results) => {
      const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
      if (failures.length) {
        drain.failed = true;
        reject(
          new AggregateError(
            failures.map(({ reason }) => reason),
            'Desktop Driver grant drain failed.',
          ),
        );
      } else {
        resolve();
      }
    });
    return drain;
  }

  /** Joins the original drain even when synchronous revocation already invalidated the grant. */
  async revokeAndDrain(grantId: string): Promise<void> {
    this.revoke(grantId);
    const root = this.revoked.get(grantId);
    if (!root) throw new TypeError('Unknown grant revocation.');
    const drains = this.subtree(root).map((stored) => {
      const drain = this.drains.get(stored.grant.id);
      return !drain || (drain.failed && drain.failureReported) ? this.startDrain(stored) : drain;
    });
    const results = await Promise.allSettled(drains.map((drain) => drain.pending));
    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') drains[index].failureReported = true;
    }
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (failures.length) {
      throw new AggregateError(
        failures.flatMap(({ reason }) => (reason instanceof AggregateError ? reason.errors : [reason])),
        'Desktop Driver grant drain failed.',
      );
    }
  }

  onRevoke(listener: (grant: DesktopGrant) => unknown): () => void {
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

function normalizeScopes(scopes: readonly GrantScope[] = ['driver-control']): readonly GrantScope[] {
  if (
    !Array.isArray(scopes) ||
    scopes.length === 0 ||
    scopes.some((scope) => !['driver-control', 'declared-workload', 'operator-recovery'].includes(scope))
  ) {
    throw new TypeError('A grant requires recognized permission scopes.');
  }
  return Object.freeze([...new Set(scopes)]);
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
