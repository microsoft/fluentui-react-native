import assert from 'node:assert/strict';
import {
  JSON_DELETION,
  applyJsonObjectDelta,
  cloneJsonValue,
  createJsonObjectDelta,
  selectCompactDeltaParent,
  serializeJson,
  serializeTypeScriptLiteral,
  sortJsonValue,
  type JsonObject,
  type JsonDeltaObject,
} from './structuredJson.ts';

declare const test: (name: string, callback: () => void) => void;

test('captures nested changes, additions, deletions, and atomic arrays', () => {
  const parent = {
    stable: 'same',
    nested: { keep: 1, change: 'before', remove: true },
    list: [1, { value: 'before' }],
    removed: 'gone',
  };
  const child = {
    stable: 'same',
    nested: { keep: 1, change: 'after', added: null },
    list: [1, { value: 'after' }],
    added: { z: 2, a: 1 },
  };

  const delta = createJsonObjectDelta(parent, child);

  assert.deepEqual(delta, {
    added: { a: 1, z: 2 },
    list: [1, { value: 'after' }],
    nested: {
      added: null,
      change: 'after',
      remove: JSON_DELETION,
    },
    removed: JSON_DELETION,
  });
  assert.deepEqual(applyJsonObjectDelta(parent, delta), child);
});

test('round trips replacements between objects, arrays, and primitives', () => {
  const parent = {
    array: [1, 2],
    object: { value: 1 },
    primitive: 'before',
  };
  const child = {
    array: { nested: true },
    object: 'after',
    primitive: {},
  };

  assert.deepEqual(applyJsonObjectDelta(parent, createJsonObjectDelta(parent, child)), child);
});

test('does not mutate or retain references from the parent or delta', () => {
  const parent = Object.freeze({
    keep: Object.freeze({ nested: Object.freeze([1, 2]) }),
    replace: Object.freeze({ old: true }),
  });
  const delta = Object.freeze({
    keep: Object.freeze({ added: Object.freeze({ value: 3 }) }),
    replace: Object.freeze({ next: Object.freeze([4, 5]) }),
  });
  const parentBefore = serializeJson(parent);
  const deltaBefore = serializeTypeScriptLiteral(delta);

  const result = applyJsonObjectDelta(parent, delta);
  (result.keep as { nested: number[] }).nested.push(3);
  (result.replace as { next: number[] }).next.push(6);

  assert.equal(serializeJson(parent), parentBefore);
  assert.equal(serializeTypeScriptLiteral(delta), deltaBefore);
  assert.notStrictEqual(result.keep, parent.keep);
  assert.notStrictEqual(result.replace, delta.replace);
});

test('deeply clones and sorts object keys while preserving array order', () => {
  const source: JsonObject = {
    z: 1,
    array: [
      { z: 2, a: 1 },
      { c: 3, b: 2 },
    ],
    a: { d: 4, c: 3 },
  };

  const clone = cloneJsonValue(source) as JsonObject;
  const sorted = sortJsonValue(source) as JsonObject;

  assert.deepEqual(clone, source);
  assert.notStrictEqual(clone, source);
  assert.notStrictEqual(clone.array, source.array);
  assert.deepEqual(Object.keys(sorted), ['a', 'array', 'z']);
  assert.deepEqual(Object.keys((sorted.array as JsonObject[])[0]), ['a', 'z']);
  assert.equal(serializeJson(source), '{"a":{"c":3,"d":4},"array":[{"a":1,"z":2},{"b":2,"c":3}],"z":1}');
});

test('emits deterministic TypeScript with safely escaped strings', () => {
  const prototypeKey = Object.fromEntries([['__proto__', { polluted: true }]]) as JsonObject;
  const first: JsonObject = {
    z: true,
    a: 'quote" slash\\ newline\n separator\u2028paragraph\u2029',
    ...prototypeKey,
  };
  const second: JsonObject = {
    ...prototypeKey,
    a: 'quote" slash\\ newline\n separator\u2028paragraph\u2029',
    z: true,
  };
  const expected = [
    '{',
    '  ["__proto__"]: {',
    '    "polluted": true',
    '  },',
    '  "a": "quote\\" slash\\\\ newline\\n separator\\u2028paragraph\\u2029",',
    '  "z": true',
    '}',
  ].join('\n');

  assert.equal(serializeTypeScriptLiteral(first), expected);
  assert.equal(serializeTypeScriptLiteral(second), expected);
});

test('requires callers to opt into diagnostic deletion serialization', () => {
  const delta: JsonDeltaObject = { removed: JSON_DELETION };

  assert.throws(() => serializeTypeScriptLiteral(delta), /Apply JSON deletions before serializing/);
  assert.equal(serializeTypeScriptLiteral(delta, { indent: 0, allowDeletionSentinel: true }), '{"removed":JSON_DELETION}');
});

const child = { a: 1, b: 2, nested: { c: 3 } };

test('selects the smallest serialized delta parent', () => {
  const selected = selectCompactDeltaParent(child, [
    { key: 'distant', value: { a: 0 } },
    { key: 'close', value: { a: 1, b: 2, nested: { c: 2 } } },
  ]);

  assert.ok(selected);
  assert.equal(selected.candidate.key, 'close');
  assert.deepEqual(selected.delta, { nested: { c: 3 } });
  assert.deepEqual(applyJsonObjectDelta(selected.candidate.value, selected.delta), child);
});

test('breaks equal-size parent ties by key independent of candidate order', () => {
  const candidates = [
    { key: 'z-parent', value: { a: 1 } },
    { key: 'a-parent', value: { a: 1 } },
  ];

  assert.equal(selectCompactDeltaParent(child, candidates)?.candidate.key, 'a-parent');
  assert.equal(selectCompactDeltaParent(child, [...candidates].reverse())?.candidate.key, 'a-parent');
});
