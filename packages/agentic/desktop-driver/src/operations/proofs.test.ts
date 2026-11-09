import type { NativeElementSnapshot, NativeObservedNode } from '../host/types';
import { fingerprintOf, matchesFingerprint, UniquenessProofs } from './proofs';

const unsupported = { reason: 'not read', supported: false } as const;

function node(fields: Partial<NativeObservedNode>): NativeObservedNode {
  return { childrenState: 'complete', depth: 1, id: 'n', role: 'button', scope: 'preview', ...fields };
}

function snapshot(fields: Partial<NativeElementSnapshot>): NativeElementSnapshot {
  return {
    checked: unsupported,
    enabled: unsupported,
    expanded: unsupported,
    focused: unsupported,
    id: 'n',
    rect: { height: 1, width: 1, x: 0, y: 0 },
    required: unsupported,
    role: 'button',
    scope: 'preview',
    selected: unsupported,
    visible: unsupported,
    windowId: 'w',
    ...fields,
  };
}

describe('fingerprints', () => {
  test('match a clipped name by its prefix and an unclipped one exactly', () => {
    const fingerprint = fingerprintOf(node({ automationId: 'save', clipped: ['name'], name: 'Save the ' }));
    expect(matchesFingerprint(fingerprint, snapshot({ automationId: 'save', name: 'Save the document' }))).toBe(true);
    expect(matchesFingerprint(fingerprint, snapshot({ automationId: 'save', name: 'Discard the document' }))).toBe(false);
    expect(matchesFingerprint(fingerprint, snapshot({ automationId: 'saved', name: 'Save the document' }))).toBe(false);
  });

  test('treat a field the sample showed empty as a promise that it is still empty, and the role as exact', () => {
    const fingerprint = fingerprintOf(node({ name: '' }));
    expect(matchesFingerprint(fingerprint, snapshot({}))).toBe(true);
    expect(matchesFingerprint(fingerprint, snapshot({ name: 'Appeared' }))).toBe(false);
    expect(matchesFingerprint(fingerprint, snapshot({ role: 'link' }))).toBe(false);
  });
});

describe('UniquenessProofs', () => {
  test('keeps the most recent proofs and forgets the oldest past its capacity', () => {
    const proofs = new UniquenessProofs(2);
    for (const sample of ['o1', 'o2', 'o3']) {
      proofs.record({ fingerprint: { role: 'button' }, nativeId: sample, reference: `${sample}e1`, sample });
    }
    expect([proofs.get('o1'), proofs.get('o2')?.nativeId, proofs.get('o3')?.nativeId]).toEqual([undefined, 'o2', 'o3']);
    proofs.clear();
    expect(proofs.size).toBe(0);
  });
});
