import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

import { CodeExpression, expression, ValuePool } from './valuePool.ts';

type AstNode = {
  type: string;
  name?: string;
  value?: unknown;
  operator?: string;
  argument?: AstNode;
  expression?: AstNode;
  elements?: (AstNode | null)[];
  properties?: AstNode[];
  key?: AstNode;
  computed?: boolean;
  callee?: AstNode;
  arguments?: AstNode[];
  declaration?: AstNode | null;
  declarations?: AstNode[];
  kind?: string;
  id?: AstNode;
  init?: AstNode | null;
  body?: AstNode[];
  program?: AstNode;
};

const babel = createRequire(import.meta.url)('@babel/core') as {
  parseSync(code: string, options: Record<string, unknown>): AstNode | null;
};

/**
 * Read the exported values of generated code by interpreting its literals, references, and spreads as data. The code
 * is parsed, never run. A call evaluates to `{ call, args }`, and an external identifier to `{ external }`.
 */
function readExports(code: string, externals: readonly string[] = ['fontWeightBold']): Record<string, unknown> {
  const file = babel.parseSync(code, {
    babelrc: false,
    configFile: false,
    filename: 'generated.ts',
    parserOpts: { plugins: ['typescript'] },
  });
  const scope = new Map<string, unknown>(externals.map((name) => [name, { external: name }]));
  const exported: Record<string, unknown> = {};
  for (const statement of file!.program!.body!) {
    const isExport = statement.type === 'ExportNamedDeclaration';
    const declaration = isExport ? statement.declaration! : statement;
    if (declaration.type === 'ImportDeclaration') {
      continue;
    }
    assert.equal(declaration.type, 'VariableDeclaration');
    assert.equal(declaration.kind, 'const');
    for (const declarator of declaration.declarations!) {
      const name = declarator.id!.name!;
      assert.ok(!scope.has(name), `${name} is declared twice`);
      scope.set(name, evaluate(declarator.init!, scope));
      if (isExport) {
        exported[name] = scope.get(name);
      }
    }
  }
  return exported;
}

function evaluate(node: AstNode, scope: ReadonlyMap<string, unknown>): unknown {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'Identifier':
      if (node.name === 'undefined') {
        return undefined;
      }
      assert.ok(scope.has(node.name!), `${node.name} is referenced before it is declared`);
      return scope.get(node.name!);
    case 'UnaryExpression':
      assert.equal(node.operator, '-');
      return -(evaluate(node.argument!, scope) as number);
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
      return evaluate(node.expression!, scope);
    case 'ArrayExpression':
      return node.elements!.map((element) => evaluate(element!, scope));
    case 'ObjectExpression': {
      const result: Record<string, unknown> = {};
      for (const property of node.properties!) {
        if (property.type === 'SpreadElement') {
          Object.assign(result, evaluate(property.argument!, scope));
        } else {
          assert.equal(property.type, 'ObjectProperty');
          assert.ok(!property.computed);
          const key = property.key!.type === 'Identifier' ? property.key!.name! : String(property.key!.value);
          result[key] = evaluate((property as { value: AstNode }).value, scope);
        }
      }
      return result;
    }
    case 'CallExpression':
      return { call: node.callee!.name, args: node.arguments!.map((argument) => evaluate(argument, scope)) };
    default:
      throw new Error(`Unexpected ${node.type} in generated code.`);
  }
}

/** The data a value is expected to read back as: expressions become calls and undefined properties disappear. */
function expected(value: unknown): unknown {
  if (value instanceof CodeExpression) {
    const open = value.code.indexOf('(');
    return open < 0 ? { external: value.code } : { call: value.code.slice(0, open), args: [value.code.slice(open + 2, -2)] };
  }
  if (Array.isArray(value)) {
    return value.map(expected);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, expected(item)]),
    );
  }
  return value;
}

function roundTrip(pool: ValuePool, declarations: Record<string, unknown>) {
  const code = pool.output();
  assert.deepEqual(readExports(code), expected(declarations));
  return code;
}

const platformColor = (name: string) => expression(`PlatformColor('${name}')`, { pure: true, name: `platformColor${name}` });

describe('ValuePool', () => {
  it('emits an equal value once and aliases equal declarations', () => {
    const value = { shadow2: { ambient: { x: 0, y: 0, blur: 2, color: '#0000003d' }, key: { x: 0, y: 1, blur: 2, color: '#00000047' } } };
    const pool = new ValuePool();
    pool.declare('darkShadows', value, { type: 'Shadows' });
    pool.declare('hcShadows', structuredClone(value), { type: 'Shadows' });
    const code = roundTrip(pool, { darkShadows: value, hcShadows: value });
    assert.match(code, /^export const hcShadows: Shadows = darkShadows;$/m);
    assert.equal(code.match(/#0000003d/g)?.length, 1);
  });

  it('shares entries in ancestors that spread the ancestors of larger member sets', () => {
    const shared = { a1: '#000001', a2: '#000002', a3: '#000003', a4: '#000004' };
    const nonContrast = { b1: '#000011', b2: '#000012', b3: '#000013', b4: '#000014' };
    const dark = { c1: '#000021', c2: '#000022', c3: '#000023', c4: '#000024' };
    const declarations = {
      lightColors: { ...shared, ...nonContrast, c1: '#ffff21', c2: '#ffff22', c3: '#ffff23', c4: '#ffff24' },
      darkColors: { ...shared, ...nonContrast, ...dark, d1: '#000031' },
      dimColors: { ...shared, ...nonContrast, ...dark, d1: '#000041' },
      contrastColors: { ...shared, b1: 'red', b2: 'green', b3: 'blue', b4: 'gray', c1: 'red', c2: 'green', c3: 'blue', c4: 'gray' },
    };
    const pool = new ValuePool();
    for (const [name, value] of Object.entries(declarations)) {
      pool.declare(name, value, { type: 'Colors' });
    }
    const code = roundTrip(pool, declarations);
    assert.match(code, /^const sharedColors = \{$/m);
    assert.match(code, /^const lightDarkDimColors = \{\n {2}\.\.\.sharedColors,$/m);
    assert.match(code, /^const darkDimColors = \{\n {2}\.\.\.lightDarkDimColors,$/m);
    assert.match(code, /^export const darkColors: Colors = \{\n {2}\.\.\.darkDimColors,\n {2}d1: '#000031',\n\};$/m);
    assert.match(code, /^export const contrastColors: Colors = \{\n {2}\.\.\.sharedColors,$/m);
    assert.equal(code.match(/a1: /g)?.length, 1);
  });

  it('shares entries of objects held under the same key', () => {
    const color = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`neutral${index}`, ['#ffffff', `#00000${index}`]]));
    const common = { spacing: { small: 4, large: 16 }, radius: { small: 2, large: 8 }, stroke: { thin: 1 }, motion: { fast: 100 } };
    const declarations = {
      coolTokenInput: { ...common, color: { ...color, brand: ['#0000ff', '#8888ff'] } },
      warmTokenInput: { ...structuredClone(common), color: { ...color, brand: ['#ff8800', '#ffaa44'] } },
    };
    const pool = new ValuePool();
    pool.declare('coolTokenInput', declarations.coolTokenInput, { type: 'TokenInput' });
    pool.declare('warmTokenInput', declarations.warmTokenInput, { type: 'TokenInput' });
    const code = roundTrip(pool, declarations);
    assert.match(code, /^const sharedTokenInput = \{\n {2}spacing: /m);
    assert.match(code, /^const sharedTokenInputColor = \{$/m);
    assert.match(code, /^ {2}color: \{ \.\.\.sharedTokenInputColor, brand: \['#0000ff', '#8888ff'\] \},$/m);
    assert.match(code, /^const rgbffffff = '#ffffff';$/m);
  });

  it('keeps values inline when sharing them would grow the output', () => {
    const declarations = { first: { a: 'ab', b: 1000000, c: [1, 2] }, second: { a: 'ab', b: 1000000, c: [1, 2], d: true } };
    const pool = new ValuePool({ ancestors: false });
    pool.declare('first', declarations.first);
    pool.declare('second', declarations.second);
    const code = roundTrip(pool, declarations);
    assert.doesNotMatch(code, /^const /m);
  });

  it('hoists repeated values with const assertions and pure calls', () => {
    const entry = { rest: ['#242424', '#ffffff'], type: 'inverted' };
    const declarations = {
      tokens: {
        a: entry,
        b: structuredClone(entry),
        c: { rest: ['#6f6f6f', '#929292'], type: 'inverted' },
        d: { rest: ['#6f6f6f', '#929292'], type: 'inverted' },
        e: platformColor('ButtonFace'),
        f: platformColor('ButtonFace'),
      },
    };
    const pool = new ValuePool();
    pool.declare('tokens', declarations.tokens);
    const code = roundTrip(pool, declarations);
    assert.match(code, /^const inverted = 'inverted';$/m);
    assert.match(code, /^const platformColorButtonFace = \/\* @__PURE__ \*\/ PlatformColor\('ButtonFace'\);$/m);
    assert.match(code, /^const a = \{ rest: \['#242424', '#ffffff'\], type: inverted \} as const;$/m);
    assert.match(code, /^ {2}b: a,$/m);
  });

  it('names values without colliding with reserved names or declarations', () => {
    const sequence = [1, 2, 3, 4, 5, 6];
    const declarations = {
      first: { value: sequence, other: [...sequence], label: 'default', again: 'default' },
      deep: { x: [...sequence] },
    };
    const pool = new ValuePool({ ancestors: false, name: (value) => (Array.isArray(value) ? 'deep' : undefined) });
    pool.reserve('defaultValue');
    pool.declare('first', declarations.first);
    pool.declare('deep', declarations.deep);
    const code = roundTrip(pool, declarations);
    assert.match(code, /^const deep1 = \[1, 2, 3, 4, 5, 6\] as const;$/m);
    assert.match(code, /^const defaultValue1 = 'default';$/m);
  });

  it('emits a declaration before the declarations that reference it', () => {
    const shared = { a: '#123456', b: '#654321', c: 'something long enough to share' };
    const declarations = { outer: { first: shared, second: shared }, inner: shared };
    const pool = new ValuePool();
    pool.declare('outer', declarations.outer);
    pool.declare('inner', declarations.inner);
    const code = roundTrip(pool, declarations);
    assert.ok(code.indexOf('export const inner') < code.indexOf('export const outer'));
    assert.match(code, /^ {2}first: inner,$/m);
  });

  it('declares a value with different types once and references it from each declaration', () => {
    const value = { a: '#123456', b: '#654321' };
    const pool = new ValuePool();
    pool.declare('first', value, { type: 'First' });
    pool.declare('second', structuredClone(value), { type: 'Second' });
    const code = roundTrip(pool, { first: value, second: value });
    assert.match(code, /^export const first: First = firstValue;$/m);
    assert.match(code, /^export const second: Second = firstValue;$/m);
  });

  it('formats declarations, comments, and satisfies clauses', () => {
    const pool = new ValuePool();
    pool.declare(
      'tokens',
      { a: 'x', 'b-c': 1, 0: null, d: undefined, e: [] },
      { comment: 'Tokens.', satisfies: 'Tokens', exported: false },
    );
    assert.equal(pool.output(), "/** Tokens. */\nconst tokens = {\n  0: null,\n  a: 'x',\n  'b-c': 1,\n  e: [],\n} satisfies Tokens;\n");
  });

  it('reduces the estimated size by sharing ancestors', () => {
    const base = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [`neutralForeground${index}`, `#0000${String(index).padStart(2, '0')}`]),
    );
    const create = (ancestors: boolean) => {
      const pool = new ValuePool({ ancestors });
      pool.declare('lightColors', { ...base, accent: '#ff0000' }, { type: 'Colors' });
      pool.declare('darkColors', { ...base, accent: '#00ff00' }, { type: 'Colors' });
      return pool.estimatedSize;
    };
    assert.ok(create(true) < create(false) * 0.6);
  });

  it('round-trips random values', () => {
    let seed = 7;
    // mulberry32
    const random = (limit: number) => {
      seed = (seed + 0x6d2b79f5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      return Math.floor((((value ^ (value >>> 14)) >>> 0) / 4294967296) * limit);
    };
    const leaves = [
      '#ffffff',
      '#000000',
      'inverted',
      'a',
      0,
      1,
      2.5,
      -1,
      true,
      null,
      platformColor('Window'),
      expression('fontWeightBold'),
    ];
    const createObject = (depth: number): Record<string, unknown> =>
      Object.fromEntries(Array.from({ length: 2 + random(8) }, () => [`key${random(10)}`, createValue(depth + 1)]));
    const createValue = (depth: number): unknown => {
      const choice = random(depth > 2 ? 2 : 4);
      if (choice < 2) {
        return leaves[random(leaves.length)];
      }
      return choice === 2 ? Array.from({ length: random(4) }, () => createValue(depth + 1)) : createObject(depth);
    };
    // Derive a variant by replacing, removing, and adding some entries, recursively in nested objects.
    const vary = (value: unknown, depth: number): unknown => {
      if (!value || typeof value !== 'object' || Array.isArray(value) || value instanceof CodeExpression) {
        return random(4) === 0 ? createValue(depth) : value;
      }
      const result: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(value)) {
        const choice = random(8);
        if (choice > 1) {
          result[key] = choice < 4 ? vary(item, depth + 1) : item;
        } else if (choice === 1) {
          result[key] = createValue(depth + 1);
        }
      }
      if (random(3) === 0) {
        result[`added${random(3)}`] = createValue(depth + 1);
      }
      return result;
    };
    let spreads = 0;
    for (let run = 0; run < 200; run++) {
      const declarations: Record<string, unknown> = {};
      const pool = new ValuePool({ identifierSize: 1 + random(2) }).reserve('fontWeightBold');
      const base = { ...createObject(2), nested: createValue(1), more: createValue(1) };
      for (let index = 0; index < 2 + random(5); index++) {
        const value = random(6) === 0 ? createValue(1) : vary(base, 1);
        declarations[`variant${index}Tokens`] = value;
        pool.declare(`variant${index}Tokens`, value, { type: random(4) === 0 ? undefined : 'Tokens' });
      }
      spreads += roundTrip(pool, declarations).includes('...') ? 1 : 0;
    }
    assert.ok(spreads > 50, `only ${spreads} runs shared ancestors`);
  });

  it('rejects values it cannot emit', () => {
    assert.throws(() => new ValuePool().declare('value', new Date()), /not a plain object/);
    assert.throws(() => new ValuePool().declare('value', () => 1), /unsupported function/);
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    assert.throws(() => new ValuePool().declare('value', circular), /circular/);
    assert.throws(() => new ValuePool().declare('default', 1), /not a valid declaration name/);
    const pool = new ValuePool().declare('value', 1);
    assert.throws(() => pool.declare('value', 2), /already declared/);
    pool.output();
    assert.throws(() => pool.declare('other', 1), /already been emitted/);
  });
});
