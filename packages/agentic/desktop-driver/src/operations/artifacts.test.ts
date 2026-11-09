import type { ArtifactProvenance } from './artifacts';
import { ArtifactStore } from './artifacts';

const provenance: ArtifactProvenance = { capturedAt: '', incarnation: 1, previewGeneration: 1, scope: 'window', window: 'w' };

function image(bytes: number) {
  return { data: new Uint8Array(bytes), height: 1, mimeType: 'image/png' as const, scaleFactor: 1, width: 1 };
}

describe('ArtifactStore', () => {
  test('drops the oldest artifacts once the total bytes exceed the limit, but never the one just added', () => {
    const store = new ArtifactStore({ maxCount: 10, maxTotalBytes: 100 });
    store.add(image(40), provenance);
    store.add(image(40), provenance);
    expect(store.add(image(150), provenance).id).toBe('a3');
    expect([store.get('a1').ok, store.get('a2').ok, store.get('a3').ok]).toEqual([false, false, true]);
    expect(store.bytes).toBe(150);

    store.add(image(10), provenance);
    expect(store.size).toBe(1);
    expect(store.get('a4').ok).toBe(true);
  });

  test('never reuses an id, so an old id reads as expired and a future one as unknown', () => {
    const store = new ArtifactStore({ maxCount: 1, maxTotalBytes: 100 });
    store.add(image(1), provenance);
    store.add(image(1), provenance);
    expect(store.get('a1')).toEqual({ failure: 'expired', ok: false });
    expect(store.get('a3')).toEqual({ failure: 'unknown', ok: false });
    expect(store.get('a01')).toEqual({ failure: 'unknown', ok: false });
  });
});
