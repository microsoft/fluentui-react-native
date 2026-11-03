import { DesktopAuthority, grantAllowsTarget } from './grants.js';

describe('DesktopAuthority', () => {
  test('issues grants whose tokens authenticate to the same grant', () => {
    const authority = new DesktopAuthority();
    const issued = authority.issue({ label: 'agent', targets: ['a', 'b'] });

    expect(authority.authenticate(`Bearer ${issued.token}`)).toEqual({ id: issued.id, label: 'agent', targets: ['a', 'b'] });
    expect(authority.authenticate(`bearer ${issued.token}`)?.id).toBe(issued.id);
  });

  test('never exposes the secret through the grant it hands to callers', () => {
    const authority = new DesktopAuthority();
    const issued = authority.issue({ label: 'agent', targets: '*' });
    const secret = issued.token.split('.')[2];

    const grant = authority.authenticate(`Bearer ${issued.token}`);

    expect(JSON.stringify(grant)).not.toContain(secret);
    expect(JSON.stringify(authority)).not.toContain(secret);
    expect(issued.id).not.toContain(secret);
  });

  test('issues distinct tokens and ids', () => {
    const authority = new DesktopAuthority();
    const first = authority.issue({ label: 'agent', targets: '*' });
    const second = authority.issue({ label: 'agent', targets: '*' });

    expect(first.id).not.toBe(second.id);
    expect(first.token).not.toBe(second.token);
    expect(authority.authenticate(`Bearer ${first.token}`)?.id).toBe(first.id);
    expect(authority.authenticate(`Bearer ${second.token}`)?.id).toBe(second.id);
  });

  test('rejects every malformed credential without throwing', () => {
    const authority = new DesktopAuthority();
    const issued = authority.issue({ label: 'agent', targets: '*' });
    const [scheme, id, secret] = issued.token.split('.');
    const credentials: (string | undefined)[] = [
      undefined,
      '',
      'Bearer',
      'Bearer ',
      issued.token,
      `Basic ${issued.token}`,
      `Bearer ${scheme}.${id}`,
      `Bearer ${scheme}.${id}.${secret}.extra`,
      `Bearer fdg2.${id}.${secret}`,
      `Bearer ${scheme}.${id}.${secret.slice(0, -1)}A`,
      `Bearer ${scheme}.${id}.`,
      `Bearer ${scheme}..${secret}`,
      `Bearer ${scheme}.${'0'.repeat(32)}.${secret}`,
      `Bearer ${scheme}.__proto__.${secret}`,
      `Bearer ${issued.token}${'x'.repeat(600)}`,
    ];

    for (const credential of credentials) {
      expect(authority.authenticate(credential)).toBeUndefined();
    }
  });

  test('stops authenticating a revoked grant and tells listeners which grant went away', () => {
    const authority = new DesktopAuthority();
    const issued = authority.issue({ label: 'wdio', targets: ['a'] });
    const revoked: string[] = [];
    authority.onRevoke(({ id }) => revoked.push(id));

    expect(authority.revoke(issued.id)).toBe(true);

    expect(authority.authenticate(`Bearer ${issued.token}`)).toBeUndefined();
    expect(revoked).toEqual([issued.id]);
    expect(authority.revoke(issued.id)).toBe(false);
    expect(revoked).toEqual([issued.id]);
  });

  test('stops notifying a listener that unsubscribed', () => {
    const authority = new DesktopAuthority();
    const issued = authority.issue({ label: 'agent', targets: '*' });
    const listener = jest.fn();

    authority.onRevoke(listener)();
    authority.revoke(issued.id);

    expect(listener).not.toHaveBeenCalled();
  });

  test('keeps grants of different authorities apart, and reports a new incarnation for each', () => {
    const first = new DesktopAuthority();
    const second = new DesktopAuthority();
    const issued = first.issue({ label: 'agent', targets: '*' });

    expect(second.authenticate(`Bearer ${issued.token}`)).toBeUndefined();
    expect(first.incarnation).toMatch(/^inc_[0-9a-f]{24}$/);
    expect(second.incarnation).not.toBe(first.incarnation);
  });

  test.each(['', 'has space', 'a'.repeat(33), 'semi;colon', 'new\nline', 'ünïcode'])('rejects the grant label %j', (label) => {
    expect(() => new DesktopAuthority().issue({ label, targets: '*' })).toThrow('label');
  });

  test.each([[[]], [['']], [['a'.repeat(201)]], [[1 as unknown as string]], [undefined as unknown as string[]]])(
    'rejects invalid grant targets (case %#)',
    (targets) => {
      expect(() => new DesktopAuthority().issue({ label: 'agent', targets })).toThrow('target');
    },
  );

  test('deduplicates and freezes the targets a grant names', () => {
    const issued = new DesktopAuthority().issue({ label: 'agent', targets: ['a', 'b', 'a'] });

    expect(issued.targets).toEqual(['a', 'b']);
    expect(Object.isFrozen(issued)).toBe(true);
    expect(Object.isFrozen(issued.targets)).toBe(true);
  });

  test('scopes a grant to the targets it names', () => {
    const authority = new DesktopAuthority();
    const some = authority.issue({ label: 'agent', targets: ['a'] });
    const all = authority.issue({ label: 'agent', targets: '*' });

    expect(grantAllowsTarget(some, 'a')).toBe(true);
    expect(grantAllowsTarget(some, 'b')).toBe(false);
    expect(grantAllowsTarget(all, 'anything')).toBe(true);
  });

  test('fails fast when a grant names a target the service does not register', () => {
    const authority = new DesktopAuthority();
    authority.issue({ label: 'agent', targets: ['a', 'typo'] });
    authority.issue({ label: 'wdio', targets: '*' });

    expect(() => authority.assertTargetsRegistered(new Set(['a', 'b']))).toThrow('"typo"');
    expect(() => authority.assertTargetsRegistered(new Set(['a', 'typo']))).not.toThrow();
  });
});
