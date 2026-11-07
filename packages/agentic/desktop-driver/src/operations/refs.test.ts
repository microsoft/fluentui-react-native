import { allocateReferenceTag, parseReference, referenceFailureError, ReferenceTable } from './refs';
import type { ReferenceTarget } from './refs';

function target(nativeId: string, overrides: Partial<ReferenceTarget> = {}): ReferenceTarget {
  return { nativeId, previewGeneration: 0, scope: 'application', windowId: 'w1', ...overrides };
}

describe('parseReference', () => {
  test('splits a tag that ends in a letter from its trailing serial', () => {
    expect(parseReference('k3xa12')).toEqual({ serial: 12, tag: 'k3xa' });
    expect(parseReference('k3xa1b7')).toEqual({ serial: 7, tag: 'k3xa1b' });
  });

  test.each([
    ['', 'empty'],
    ['k3xa', 'no serial'],
    ['12345', 'no tag'],
    ['abc12', 'tag too short'],
    ['abcd0', 'serial zero'],
    ['abcd012', 'leading zero'],
    ['abcd1234567890', 'serial too long'],
    ['ab-d12', 'foreign character'],
    ['ABCD12', 'uppercase'],
    ['abc112', 'tag must end in a letter'],
    ['a'.repeat(40) + '1', 'longer than any reference'],
    ['abcdefghi1', 'tag too long'],
    ['1'.repeat(32), 'digits only'],
  ])('rejects %j (%s)', (value) => {
    expect(parseReference(value)).toBeUndefined();
  });
});

describe('allocateReferenceTag', () => {
  test('returns tags that parse and end in a letter', () => {
    for (let index = 0; index < 200; index += 1) {
      const tag = allocateReferenceTag(() => false);
      expect(tag).toMatch(/^[a-z0-9]{3}[a-z]$/);
      expect(parseReference(`${tag}1`)?.tag).toBe(tag);
    }
  });

  test('skips taken tags and widens when a length is crowded', () => {
    const attempts: string[] = [];
    const tag = allocateReferenceTag((candidate) => {
      attempts.push(candidate);
      return candidate.length === 4;
    });

    expect(tag).toHaveLength(5);
    expect(attempts.filter((candidate) => candidate.length === 4)).toHaveLength(8);
  });

  test('fails rather than reuse a tag once every length is exhausted', () => {
    expect(() => allocateReferenceTag(() => true)).toThrow('No unused element reference tag');
  });
});

describe('ReferenceTable', () => {
  test('issues one stable reference per native id and never reuses a serial', () => {
    const table = new ReferenceTable('k3xa');

    const first = table.issue(target('e1'), 1);
    const second = table.issue(target('e2'), 1);
    expect(first).toBe('k3xa1');
    expect(second).toBe('k3xa2');
    expect(table.issue(target('e1'), 2)).toBe(first);

    table.drop(first);
    expect(table.issue(target('e1'), 3)).toBe('k3xa3');
    expect(table.holds('e1')).toBe(true);
    expect(table.size).toBe(2);
  });

  test('classifies every way a reference can fail to resolve', () => {
    const table = new ReferenceTable('k3xa');
    const live = table.issue(target('e1'), 1);
    const dropped = table.issue(target('e2'), 1);
    table.drop(dropped);
    table.issue(target('e3', { scope: 'preview' }), 1);

    expect(table.resolve(live, 0)).toMatchObject({ entry: { nativeId: 'e1' }, ok: true });
    expect(table.resolve(dropped, 0)).toEqual({ failure: 'expired', ok: false });
    expect(table.resolve('k3xa99', 0)).toEqual({ failure: 'unknown', ok: false });
    expect(table.resolve('zzzz1', 0)).toEqual({ failure: 'foreign', ok: false });
    expect(table.resolve('not a ref', 0)).toEqual({ failure: 'malformed', ok: false });
    expect(table.resolve('k3xa3', 0)).toMatchObject({ ok: true });
    expect(table.resolve('k3xa3', 1)).toEqual({ failure: 'region-changed', ok: false });
  });

  test('reobserving a retained preview native id cannot revive a reference from an earlier region', () => {
    const table = new ReferenceTable('k3xa');
    const before = table.issue(target('preview-root', { scope: 'preview' }), 1);
    expect(table.resolve(before, 1)).toEqual({ failure: 'region-changed', ok: false });

    const current = table.issue(target('preview-root', { scope: 'preview', previewGeneration: 1 }), 2);

    expect(table.resolve(before, 1)).toMatchObject({ ok: false });
    expect(current).not.toBe(before);
    expect(table.resolve(current, 1)).toMatchObject({ entry: { nativeId: 'preview-root', previewGeneration: 1 }, ok: true });
    expect(table.issue(target('preview-root', { scope: 'preview', previewGeneration: 1 }), 3)).toBe(current);
  });

  test.each(['application', 'chrome', 'secondary-window'] as const)(
    'reobserving %s retains its reference across preview generations',
    (scope) => {
      const table = new ReferenceTable('k3xa');
      const before = table.issue(target('retained', { scope }), 1);
      expect(table.issue(target('retained', { scope, previewGeneration: 1 }), 2)).toBe(before);
      expect(table.resolve(before, 1)).toMatchObject({ ok: true });
    },
  );

  test('an earlier incarnation stops resolving and is reported as earlier, not foreign', () => {
    const table = new ReferenceTable('k3xa');
    const before = table.issue(target('e1'), 1);

    table.reset('p9qb');

    expect(table.size).toBe(0);
    expect(table.resolve(before, 0)).toEqual({ failure: 'earlier-incarnation', ok: false });
    expect(table.issue(target('e1'), 2)).toBe('p9qb2');
    expect(table.resolve('zzzz1', 0)).toEqual({ failure: 'foreign', ok: false });
  });

  test('evicts stale-region references first, then the least recently seen, and keeps the current sequence', () => {
    const table = new ReferenceTable('k3xa', 512);
    const stale = table.issue(target('stale', { scope: 'preview' }), 5);
    for (let index = 0; index < 511; index += 1) {
      table.issue(target(`old${index}`), index === 0 ? 1 : 2);
    }
    for (let index = 0; index < 3; index += 1) {
      table.issue(target(`new${index}`), 9);
    }

    const released = table.evict(9, 1);

    expect(released).toHaveLength(3);
    expect(released[0]).toBe('stale');
    expect(released).toContain('old0');
    expect(table.size).toBe(512);
    expect(table.resolve(stale, 1)).toEqual({ failure: 'expired', ok: false });
    expect(table.holds('new0') && table.holds('new1') && table.holds('new2')).toBe(true);
  });

  test('drops every reference into a closed window', () => {
    const table = new ReferenceTable('k3xa');
    table.issue(target('a1', { windowId: 'w1' }), 1);
    table.issue(target('b1', { windowId: 'w2' }), 1);
    table.issue(target('a2', { windowId: 'w1' }), 1);

    expect(table.dropWindow('w1').sort()).toEqual(['a1', 'a2']);
    expect(table.holds('b1')).toBe(true);
    expect(table.size).toBe(1);
  });

  test('sizes the longest reference the next issues could produce', () => {
    const table = new ReferenceTable('k3xa');
    for (let index = 0; index < 98; index += 1) {
      table.issue(target(`e${index}`), 1);
    }

    expect(table.maxLength(1)).toBe('k3xa99'.length);
    expect(table.maxLength(2)).toBe('k3xa100'.length);
  });
});

describe('referenceFailureError', () => {
  test('maps each failure to a WebDriver code with a machine reason and no echoed content', () => {
    expect(referenceFailureError('expired', 'k3xa1')).toMatchObject({ code: 'stale element reference', data: { reason: 'ref-expired' } });
    expect(referenceFailureError('foreign', 'k3xa1')).toMatchObject({ code: 'no such element', data: { reason: 'ref-foreign' } });
    expect(referenceFailureError('malformed', 'x')).toMatchObject({ code: 'invalid argument', data: { reason: 'ref-malformed' } });
    expect(referenceFailureError('malformed', 'bad\nline\u0007').message).toBe('Reference "bad?line?" is not an element reference.');
  });
});
