const { invariant } = require('./common.cjs');

function parseTokenJson(text, file) {
  const parsed = JSON.parse(text);
  const objects = [];
  // JSON.parse has checked the grammar; this pass preserves duplicate keys.
  const tokens = text.matchAll(/"(?:[^"\\]|\\.)*"|[{}:[\],]/g);
  let previous;
  for (const token of tokens) {
    if (token[0] === '{') objects.push(new Set());
    if (token[0] === '}') objects.pop();
    if (token[0] === ':') {
      const key = JSON.parse(previous[0]);
      const fields = objects.at(-1);
      if (fields.has(key)) {
        const line = text.slice(0, previous.index).split('\n').length;
        throw new Error(`${file}:${line}: duplicate token key "${key}".`);
      }
      fields.add(key);
    }
    previous = token;
  }
  return parsed;
}

function validateTokenCompanion(text, component, file) {
  const schema = parseTokenJson(text, file);
  const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const safe = (key) => key !== 'constructor' && key !== 'prototype' && key !== '__proto__';
  invariant(plain(schema) && schema.schemaVersion === 2 && schema.component === component, `${file} has the wrong version or component.`);
  invariant(typeof schema.implementation === 'string' && schema.implementation, `${file} must identify its implementation.`);
  invariant(Array.isArray(schema.tokenGaps), `${file} must declare tokenGaps.`);
  invariant(Array.isArray(schema.axes), `${file} must declare ordered axes.`);
  invariant(plain(schema.bindings) && Object.keys(schema.bindings).length > 0, `${file} must declare slot bindings.`);

  const axes = new Set();
  const selectors = new Map();
  for (const [rank, axis] of schema.axes.entries()) {
    invariant(Array.isArray(axis) && axis.length === 2, `${file}: expected [field, members] axis.`);
    const [field, members] = axis;
    invariant(
      typeof field === 'string' && safe(field) && field && !field.includes('.') && !axes.has(field),
      `${file}: invalid axis ${field}.`,
    );
    axes.add(field);
    invariant(Array.isArray(members) && members.length, `${file}: axis ${field} must have members.`);
    for (const member of members) {
      const type = typeof member;
      invariant(
        type === 'boolean' ||
          (type === 'number' && Number.isFinite(member) && !String(member).includes('.')) ||
          (type === 'string' && member && safe(member) && !member.includes('.')),
        `${file}: invalid member of ${field}.`,
      );
      const selector = `when.${field}.${member}`;
      invariant(!selectors.has(selector), `${file}: ambiguous selector ${selector}.`);
      selectors.set(selector, rank);
    }
  }

  function walk(node, path, rank) {
    invariant(plain(node), `${path}: expected an object.`);
    for (const [key, value] of Object.entries(node)) {
      const field = `${path}.${key}`;
      invariant(safe(key), `${field}: invalid token field.`);
      if (key.startsWith('when.')) {
        const next = selectors.get(key);
        invariant(next > rank, `${field}: unknown, repeated, or out-of-order selector.`);
        walk(value, field, next);
      } else {
        invariant(value !== null, `${field}: null token values are not supported.`);
        if (typeof value === 'string' && value.startsWith('tokens:')) {
          const parts = value.slice(7).split('.');
          const [group, name, member] = parts;
          invariant(
            name &&
              safe(name) &&
              safe(group) &&
              (group === 'color' ? parts.length === 3 && ['rest', 'hover', 'pressed', 'active'].includes(member) : parts.length === 2),
            `${field}: malformed Flex reference ${value}.`,
          );
          invariant(member !== 'active' || axes.has('visualState'), `${field}: active color requires a visualState axis.`);
        }
      }
    }
  }

  for (const [slot, node] of Object.entries(schema.bindings)) {
    invariant(safe(slot), `${file}: invalid slot ${slot}.`);
    walk(node, `${file}:${slot}`, -1);
  }
}

module.exports = { validateTokenCompanion };
