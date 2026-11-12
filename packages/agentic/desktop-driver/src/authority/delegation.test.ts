import { DesktopAuthority } from './grants.js';

describe('attenuated grants', () => {
  test('runner descendants inherit their target reservation and attach-only restriction without workload or recovery rights', () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({
      label: 'operator',
      targets: ['a', 'b'],
      scopes: ['driver-control', 'declared-workload', 'operator-recovery'],
    });
    const runner = authority.delegateRunner(parent.id, 'a');
    const worker = authority.delegate(runner.id, { label: 'worker', targets: ['a'] });
    expect(runner.targets).toEqual(['a']);
    expect(worker.scopes).toEqual(['driver-control']);
    expect(worker.runner).toEqual({ controllerId: runner.id, attachOnly: true });
    expect(Object.isFrozen(worker.runner)).toBe(true);
    expect(() => authority.delegateRunner(runner.id, 'a')).toThrow();
    expect(() => authority.delegateRunner(parent.id, 'outside')).toThrow();
    expect(() => authority.delegate(worker.id, { label: 'expand', targets: ['b'] })).toThrow();
  });
  test('isolates siblings even when their labels and target scopes match', () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: ['a', 'b'] });
    const first = authority.delegate(parent.id, { label: 'agent', targets: ['a'] });
    const second = authority.delegate(parent.id, { label: 'agent', targets: ['a'] });

    expect(first.id).not.toBe(second.id);
    expect(first.token).not.toBe(second.token);
    expect(authority.authenticate(`Bearer ${first.token}`)?.id).toBe(first.id);
    expect(authority.authenticate(`Bearer ${second.token}`)?.id).toBe(second.id);
  });

  test('refuses target and permission expansion', () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: ['a'], scopes: ['driver-control'] });

    expect(() => authority.delegate(parent.id, { label: 'child', targets: '*' })).toThrow();
    expect(() => authority.delegate(parent.id, { label: 'child', targets: ['b'] })).toThrow();
    for (const scope of ['declared-workload', 'operator-recovery'] as const) {
      expect(() => authority.delegate(parent.id, { label: 'child', targets: ['a'], scopes: [scope] })).toThrow();
    }
  });

  test('invalidates the entire subtree before awaiting every drain listener', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const child = authority.delegate(parent.id, { label: 'child', targets: ['a'] });
    const descendant = authority.delegate(child.id, { label: 'nested', targets: ['a'] });
    const sibling = authority.issue({ label: 'agent', targets: '*' });
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const drained: string[] = [];
    authority.onRevoke(async ({ id }) => {
      await pending;
      drained.push(id);
    });

    const drain = authority.revokeAndDrain(parent.id);
    for (const grant of [parent, child, descendant]) {
      expect(authority.authenticate(`Bearer ${grant.token}`)).toBeUndefined();
    }
    expect(authority.authenticate(`Bearer ${sibling.token}`)?.id).toBe(sibling.id);
    expect(drained).toEqual([]);
    finish();
    await drain;
    expect(new Set(drained)).toEqual(new Set([parent.id, child.id, descendant.id]));
  });

  test('reports drain failure without resurrecting any credentials', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const child = authority.delegate(parent.id, { label: 'child', targets: ['a'] });
    authority.onRevoke(async () => {
      throw new Error('injected drain failure');
    });

    await expect(authority.revokeAndDrain(parent.id)).rejects.toThrow();
    expect(authority.authenticate(`Bearer ${child.token}`)).toBeUndefined();
    await expect(authority.revokeAndDrain(parent.id)).rejects.toThrow();
  });

  test('joins concurrent parent and child retries without repeating successful listeners', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const child = authority.delegate(parent.id, { label: 'child', targets: '*' });
    const calls: string[] = [];
    let failed = false;
    authority.onRevoke(({ id }) => {
      calls.push(id);
      if (id === child.id && !failed) {
        failed = true;
        throw new Error('injected child drain failure');
      }
    });
    await expect(authority.revokeAndDrain(parent.id)).rejects.toThrow('drain failed');
    await Promise.all([authority.revokeAndDrain(parent.id), authority.revokeAndDrain(child.id)]);
    expect(calls.filter((id) => id === parent.id)).toHaveLength(1);
    expect(calls.filter((id) => id === child.id)).toHaveLength(2);
    await expect(authority.revokeAndDrain('missing')).rejects.toThrow('Unknown grant');
  });

  test('reports an unobserved legacy drain failure before allowing a successful retry', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const listener = jest.fn().mockRejectedValueOnce(new Error('injected failure')).mockResolvedValue(undefined);
    authority.onRevoke(listener);
    authority.revoke(parent.id);
    await new Promise<void>((resolve) => setImmediate(resolve));
    await expect(authority.revokeAndDrain(parent.id)).rejects.toThrow('drain failed');
    expect(listener).toHaveBeenCalledTimes(1);
    await expect(authority.revokeAndDrain(parent.id)).resolves.toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('joins an already revoked descendant drain when its parent is revoked', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    const child = authority.delegate(parent.id, { label: 'child', targets: ['a'] });
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    authority.onRevoke(({ id }) => (id === child.id ? pending : undefined));
    authority.revoke(child.id);
    let completed = false;
    const drain = authority.revokeAndDrain(parent.id).then(() => {
      completed = true;
    });
    await Promise.resolve();
    expect(completed).toBe(false);
    finish();
    await drain;
  });

  test('accepts equal and narrower scopes, freezes them, and defaults roots to driver only', () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'operator', targets: '*', scopes: ['driver-control', 'operator-recovery'] });
    const child = authority.delegate(parent.id, { label: 'child', targets: ['a'], scopes: ['driver-control'] });
    expect(child.scopes).toEqual(['driver-control']);
    expect(Object.isFrozen(child.scopes)).toBe(true);
    expect(authority.delegate(child.id, { label: 'equal', targets: ['a'] }).scopes).toEqual(child.scopes);
    expect(authority.issue({ label: 'default', targets: '*' }).scopes).toEqual(['driver-control']);
  });

  test('bounds depth and service-lifetime issuance without evicting cleanup proof', async () => {
    const authority = new DesktopAuthority();
    const parent = authority.issue({ label: 'agent', targets: '*' });
    let current = parent;
    for (let depth = 0; depth < 8; depth += 1) {
      current = authority.delegate(current.id, { label: 'child', targets: '*' });
    }
    expect(() => authority.delegate(current.id, { label: 'too-deep', targets: '*' })).toThrow();
    await authority.revokeAndDrain(current.id);
    for (let index = 9; index < 4096; index += 1) authority.issue({ label: 'bounded', targets: '*' });
    expect(() => authority.issue({ label: 'exhausted', targets: '*' })).toThrow('limit');
    expect(authority.authenticateRevocation(`Bearer ${current.token}`)?.id).toBe(current.id);
    expect(authority.authenticate(`Bearer ${current.token}`)).toBeUndefined();
  });
});
