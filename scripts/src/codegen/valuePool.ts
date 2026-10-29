import type { Chunk } from './file.ts';

/** Options for a {@link CodeExpression}. */
export type ExpressionOptions = {
  /** Base name for the constant when the expression is hoisted. */
  name?: string;
  /** Marks a call as free of side effects, so bundlers can drop it when it is unused. */
  pure?: boolean;
  /** Estimated minified size in bytes. Defaults to an estimate that counts each identifier as a mangled name. */
  size?: number;
};

/** JavaScript emitted verbatim, such as an imported identifier or a call. */
export class CodeExpression {
  readonly code: string;
  readonly name: string | undefined;
  readonly pure: boolean;
  readonly size: number | undefined;

  constructor(code: string, options: ExpressionOptions = {}) {
    this.code = code;
    this.name = options.name;
    this.pure = options.pure ?? false;
    this.size = options.size;
  }
}

/** Create a {@link CodeExpression}. */
export function expression(code: string, options?: ExpressionOptions): CodeExpression {
  return new CodeExpression(code, options);
}

/** Values a {@link ValuePool} can emit. Objects must be plain objects; object properties set to undefined are omitted. */
export type CodeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | CodeExpression
  | readonly CodeValue[]
  | { readonly [key: string]: CodeValue };

/** Property keys and array indices from a declaration to a value. The first segment is the declaration name. */
export type ValuePath = readonly (string | number)[];

/** Options for a {@link ValuePool}. */
export type ValuePoolOptions = {
  /** Base name for a hoisted value. Return undefined to use the default name. */
  name?: (value: unknown, path: ValuePath) => string | undefined;
  /** Extract entries that declarations of the same family share into common ancestor objects. Defaults to true. */
  ancestors?: boolean;
  /** Add `as const` to hoisted arrays and objects, so literal and tuple types survive hoisting. Defaults to true. */
  constAssertions?: boolean;
  /** Estimated length of a minified identifier, used to decide what to share. Defaults to 2. */
  identifierSize?: number;
  /** Line width for formatting. Defaults to 140. */
  printWidth?: number;
};

/** Options for a declaration added with {@link ValuePool.declare}. */
export type DeclarationOptions = {
  /** Export the declaration. Defaults to true. */
  exported?: boolean;
  /** Type annotation, as in `const name: Type`. */
  type?: string;
  /** Type for a `satisfies` clause. */
  satisfies?: string;
  /** Documentation comment for the declaration. */
  comment?: string | string[];
  /** Object declarations in the same family share ancestors. Defaults to the type annotation. */
  family?: string;
};

type Entry = readonly [key: string, node: ValueNode];

type Family = {
  /** Declaration names of the family's object members, in declaration order. */
  readonly roots: readonly string[];
  /** Common camel-case suffix of the root names, such as `Shadows`. Empty when the names share none. */
  readonly suffix: string;
  readonly name: string;
};

type AncestorInfo = {
  readonly family: Family;
  /** Declaration names whose value includes this ancestor. */
  readonly roots: readonly string[];
  /** Property keys from the declarations to the objects that spread this ancestor. */
  readonly path: readonly string[];
};

type ValueNode = {
  readonly id: number;
  readonly kind: 'literal' | 'expression' | 'array' | 'object';
  /** The value and path where the node first occurred, for naming. */
  readonly source: unknown;
  readonly path: ValuePath;
  readonly literal?: string | number | boolean | null | undefined;
  readonly expression?: CodeExpression;
  readonly items?: readonly ValueNode[];
  /** Object entries in first-occurrence order. */
  readonly entries?: readonly Entry[];
  readonly lookup?: ReadonlyMap<string, ValueNode>;
  /** Ancestor objects this object spreads; `own` holds the entries they do not cover. */
  spreads?: ValueNode[];
  own?: Entry[];
  ancestor?: AncestorInfo;
};

type Declaration = {
  readonly name: string;
  readonly node: ValueNode;
  readonly options: DeclarationOptions;
  readonly family: string;
  readonly index: number;
};

type Item = {
  readonly node: ValueNode;
  /** The declaration this item emits; undefined for a hoisted constant. */
  readonly declaration?: Declaration;
  readonly rank: readonly (number | string)[];
  readonly group: string;
  dependencies: Item[];
};

const identifierPattern = /^[A-Za-z_$][\w$]*$/;
const indexPattern = /^(?:0|[1-9]\d*)$/;
const hexColorPattern = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const wordPattern = /^[A-Za-z][A-Za-z0-9]{0,23}$/;
const reservedWords = new Set(
  (
    'arguments await break case catch class const continue debugger default delete do else enum eval export extends false ' +
    'finally for function if implements import in instanceof interface let new null package private protected public ' +
    'return static super switch this throw true try typeof undefined var void while with yield NaN Infinity'
  ).split(' '),
);
const maxHoistingPasses = 8;

function formatPath(path: ValuePath): string {
  return path.map((segment, index) => (typeof segment === 'number' ? `[${segment}]` : index === 0 ? segment : `.${segment}`)).join('');
}

function quote(value: string): string {
  let text = "'";
  for (const char of value) {
    if (char === "'" || char === '\\') {
      text += `\\${char}`;
    } else if (char === '\n') {
      text += '\\n';
    } else if (char === '\r') {
      text += '\\r';
    } else if (char === '\u2028' || char === '\u2029') {
      text += char === '\u2028' ? '\\u2028' : '\\u2029';
    } else {
      text += char;
    }
  }
  return `${text}'`;
}

function literalCode(value: ValueNode['literal']): string {
  if (typeof value === 'string') {
    return quote(value);
  }
  if (typeof value === 'number' && Object.is(value, -0)) {
    return '-0';
  }
  return String(value);
}

function propertyKey(key: string): string {
  return identifierPattern.test(key) || indexPattern.test(key) ? key : quote(key);
}

/** Minified size of a number as esbuild prints it, such as `.5` for 0.5 and `1e3` for 1000. */
function numberSize(value: number): number {
  let text = Object.is(value, -0) ? '-0' : String(value);
  if (text.startsWith('0.') || text.startsWith('-0.')) {
    text = text.replace('0.', '.');
  }
  if (Number.isInteger(value) && Math.abs(value) >= 1000) {
    let zeros = 0;
    while (text[text.length - 1 - zeros] === '0') {
      zeros++;
    }
    if (zeros >= 3) {
      return text.length - zeros + 1 + String(zeros).length;
    }
  }
  return text.length;
}

function literalSize(value: ValueNode['literal']): number {
  switch (typeof value) {
    case 'string':
      return JSON.stringify(value).length;
    case 'number':
      return numberSize(value);
    case 'boolean':
      return 2;
    case 'undefined':
      return 6;
    default:
      return 4;
  }
}

function keySize(key: string): number {
  return identifierPattern.test(key) || indexPattern.test(key) ? key.length : JSON.stringify(key).length;
}

function isIdentifierStart(char: string): boolean {
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_' || char === '$';
}

function isIdentifierPart(char: string): boolean {
  return isIdentifierStart(char) || (char >= '0' && char <= '9');
}

/** Visit the code outside string literals, reporting identifiers and the other characters a minifier keeps. */
function scanCode(code: string, onIdentifier: (name: string, isProperty: boolean) => void, onOther: (length: number) => void) {
  let previous = '';
  let index = 0;
  while (index < code.length) {
    const char = code[index];
    if (char === "'" || char === '"' || char === '`') {
      let end = index + 1;
      while (end < code.length && code[end] !== char) {
        end += code[end] === '\\' ? 2 : 1;
      }
      onOther(Math.min(end + 1, code.length) - index);
      previous = char;
      index = end + 1;
    } else if (isIdentifierStart(char)) {
      let end = index + 1;
      while (end < code.length && isIdentifierPart(code[end])) {
        end++;
      }
      onIdentifier(code.slice(index, end), previous === '.');
      previous = 'a';
      index = end;
    } else {
      if (char.trim() !== '') {
        onOther(1);
        previous = char;
      }
      index++;
    }
  }
}

function expressionSize(value: CodeExpression, identifierSize: number): number {
  if (value.size !== undefined) {
    return value.size;
  }
  let size = 0;
  scanCode(
    value.code,
    (name, isProperty) => (size += isProperty ? name.length : identifierSize),
    (length) => (size += length),
  );
  return size;
}

function expressionCode(value: CodeExpression): string {
  return value.pure ? `/* @__PURE__ */ ${value.code}` : value.code;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Convert text to a valid identifier, camel-casing across invalid characters. */
function toIdentifier(text: string): string {
  let name = '';
  let upper = false;
  for (const char of text) {
    if (isIdentifierPart(char)) {
      name += upper && name ? char.toUpperCase() : char;
      upper = false;
    } else {
      upper = true;
    }
  }
  if (!name) {
    return 'value';
  }
  if (!isIdentifierStart(name[0])) {
    name = `_${name}`;
  }
  return reservedWords.has(name) ? `${name}Value` : name;
}

function splitWords(name: string): string[] {
  const words: string[] = [];
  let start = 0;
  for (let index = 1; index < name.length; index++) {
    if (name[index] >= 'A' && name[index] <= 'Z') {
      words.push(name.slice(start, index));
      start = index;
    }
  }
  words.push(name.slice(start));
  return words;
}

function createFamily(name: string, roots: readonly string[]): Family {
  const words = roots.map(splitWords);
  const suffix: string[] = [];
  for (;;) {
    const position = suffix.length + 1;
    const word = words[0][words[0].length - position];
    if (!words.every((list) => list.length > position && list[list.length - position] === word)) {
      break;
    }
    suffix.unshift(word);
  }
  return { name, roots, suffix: suffix.join('') };
}

function ancestorName({ family, roots, path }: AncestorInfo): string {
  const pathPart = path.map((key) => capitalize(toIdentifier(key))).join('');
  if (!family.suffix) {
    return toIdentifier(`shared ${family.name} ${pathPart}`);
  }
  if (family.roots.every((root) => roots.includes(root))) {
    return `shared${family.suffix}${pathPart}`;
  }
  const prefixes = family.roots.filter((root) => roots.includes(root)).map((root) => root.slice(0, root.length - family.suffix.length));
  return toIdentifier(prefixes.map((prefix, index) => (index === 0 ? prefix : capitalize(prefix))).join('') + family.suffix + pathPart);
}

function compareRank(left: readonly (number | string)[], right: readonly (number | string)[]): number {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    if (left[index] !== right[index]) {
      return left[index] < right[index] ? -1 : 1;
    }
  }
  return left.length - right.length;
}

function writeDocComment(text: string | string[]): string {
  const lines = Array.isArray(text) ? text : text.split('\n');
  return lines.length === 1 ? `/** ${lines[0]} */` : `/**\n${lines.map((line) => (line ? ` * ${line}` : ' *')).join('\n')}\n */`;
}

/**
 * A value pool emits constant declarations and minimizes their minified size. Equal values are emitted once and shared,
 * which a size model decides per value: strings, expressions, arrays, and objects are hoisted into constants when that
 * is smaller than repeating them. Object declarations in the same family share common ancestor objects: entries that
 * several members hold are emitted once in an ancestor that the members spread, recursively for nested objects, and
 * ancestors spread the ancestors of larger member sets. Hex color strings are named `rgb<hex>`, as a Ramp names them.
 *
 * Shared objects and ancestors change the key order of emitted objects. Declarations are emitted in dependency order.
 */
export class ValuePool implements Chunk {
  private readonly _ancestors: boolean;
  private readonly _constAssertions: boolean;
  private readonly _identifierSize: number;
  private readonly _printWidth: number;
  private readonly _name: ValuePoolOptions['name'];
  private readonly _declarations: Declaration[] = [];
  private readonly _reserved = new Set<string>();
  private readonly _nodes = new Map<string, ValueNode>();
  private readonly _canonicalSizes = new Map<ValueNode, number>();
  private _names = new Map<ValueNode, string>();
  private _output: string | undefined;
  private _size = 0;

  constructor(options: ValuePoolOptions = {}) {
    this._ancestors = options.ancestors ?? true;
    this._constAssertions = options.constAssertions ?? true;
    this._identifierSize = options.identifierSize ?? 2;
    this._printWidth = options.printWidth ?? 140;
    this._name = options.name;
  }

  /** Reserve names, such as imports, that hoisted constants must not use. */
  reserve(...names: string[]): this {
    this.assertOpen();
    for (const name of names) {
      this._reserved.add(name);
    }
    return this;
  }

  /** Declare a constant. Declarations are emitted in the order they are declared, after the values they reference. */
  declare(name: string, value: unknown, options: DeclarationOptions = {}): this {
    this.assertOpen();
    if (!identifierPattern.test(name) || reservedWords.has(name)) {
      throw new Error(`${name} is not a valid declaration name.`);
    }
    if (this._declarations.some((declaration) => declaration.name === name)) {
      throw new Error(`${name} is already declared.`);
    }
    const node = this.intern(value, [name], new Set());
    const family = options.family ?? options.type ?? options.satisfies ?? '';
    this._declarations.push({ name, node, options, family, index: this._declarations.length });
    return this;
  }

  /** Estimated minified size in bytes of the emitted declarations. */
  get estimatedSize(): number {
    this.resolve();
    return this._size;
  }

  output(): string {
    return this.resolve();
  }

  private assertOpen() {
    if (this._output !== undefined) {
      throw new Error('The value pool has already been emitted.');
    }
  }

  private intern(value: unknown, path: ValuePath, active: Set<object>): ValueNode {
    if (value instanceof CodeExpression) {
      return this.node(`e${value.code}`, { kind: 'expression', expression: value }, value, path);
    }
    switch (typeof value) {
      case 'string':
        return this.node(`s${value}`, { kind: 'literal', literal: value }, value, path);
      case 'number':
        return this.node(`n${Object.is(value, -0) ? '-0' : String(value)}`, { kind: 'literal', literal: value }, value, path);
      case 'boolean':
      case 'undefined':
        return this.node(`l${value}`, { kind: 'literal', literal: value }, value, path);
      case 'object':
        break;
      default:
        throw new Error(`${formatPath(path)} is an unsupported ${typeof value} value.`);
    }
    if (value === null) {
      return this.node('lnull', { kind: 'literal', literal: null }, value, path);
    }
    if (active.has(value)) {
      throw new Error(`${formatPath(path)} is circular.`);
    }
    active.add(value);
    try {
      if (Array.isArray(value)) {
        const items = Array.from(value as unknown[], (item, index) => this.intern(item, [...path, index], active));
        return this.node(`a${items.map((item) => item.id).join(',')}`, { kind: 'array', items }, value, path);
      }
      const prototype: unknown = Object.getPrototypeOf(value);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new Error(`${formatPath(path)} is not a plain object.`);
      }
      const entries: Entry[] = [];
      for (const [key, item] of Object.entries(value)) {
        if (key === '__proto__') {
          throw new Error(`${formatPath(path)} has an unsupported __proto__ key.`);
        }
        if (item !== undefined) {
          entries.push([key, this.intern(item, [...path, key], active)]);
        }
      }
      return this.objectNode(entries, value, path);
    } finally {
      active.delete(value);
    }
  }

  private objectNode(entries: readonly Entry[], source: unknown, path: ValuePath): ValueNode {
    const key = `o${entries
      .map(([name, node]) => `${JSON.stringify(name)}:${node.id}`)
      .sort()
      .join(',')}`;
    return this.node(key, { kind: 'object', entries, lookup: new Map(entries) }, source, path);
  }

  private node(key: string, shape: Omit<ValueNode, 'id' | 'source' | 'path'>, source: unknown, path: ValuePath): ValueNode {
    let node = this._nodes.get(key);
    if (!node) {
      node = { ...shape, id: this._nodes.size, source, path };
      this._nodes.set(key, node);
    }
    return node;
  }

  private extractFamilies() {
    const families = new Map<string, Declaration[]>();
    for (const declaration of this._declarations) {
      const list = families.get(declaration.family) ?? [];
      list.push(declaration);
      families.set(declaration.family, list);
    }
    for (const [name, declarations] of families) {
      const objects = declarations.filter(({ node }) => node.kind === 'object');
      const members: ValueNode[] = [];
      const memberRoots: string[][] = [];
      for (const { name: root, node } of objects) {
        const index = members.indexOf(node);
        if (index >= 0) {
          memberRoots[index].push(root);
        } else {
          members.push(node);
          memberRoots.push([root]);
        }
      }
      if (members.length >= 2) {
        const family = createFamily(
          name,
          objects.map((declaration) => declaration.name),
        );
        this.extractAncestors(family, members, memberRoots, []);
      }
    }
  }

  /**
   * Group the entries of distinct objects by the set of objects that hold them, and move each group that is smaller
   * shared into an ancestor object. An ancestor spreads the ancestors of the smallest larger sets that contain its set,
   * and each object spreads the ancestors of the smallest sets that contain it. Objects held under the same key recurse.
   */
  private extractAncestors(
    family: Family,
    nodes: readonly ValueNode[],
    nodeRoots: readonly (readonly string[])[],
    path: readonly string[],
  ) {
    const members = nodes.flatMap((node, index) => (node.spreads ? [] : [{ node, roots: nodeRoots[index] }]));
    if (members.length < 2) {
      return;
    }
    type Group = { members: number[]; entries: Entry[]; node?: ValueNode };
    const groups = new Map<string, Group>();
    const keys = new Set(members.flatMap(({ node }) => node.entries!.map(([key]) => key)));
    for (const key of keys) {
      const holders = new Map<ValueNode, number[]>();
      members.forEach(({ node }, index) => {
        const value = node.lookup!.get(key);
        if (value) {
          const list = holders.get(value);
          if (list) {
            list.push(index);
          } else {
            holders.set(value, [index]);
          }
        }
      });
      for (const [value, indices] of holders) {
        if (indices.length >= 2) {
          const signature = indices.join(',');
          const group = groups.get(signature) ?? { members: indices, entries: [] };
          group.entries.push([key, value]);
          groups.set(signature, group);
        }
      }
      const objects = [...holders.keys()].filter((value) => value.kind === 'object');
      if (objects.length >= 2) {
        const roots = objects.map((value) => holders.get(value)!.flatMap((index) => members[index].roots));
        this.extractAncestors(family, objects, roots, [...path, key]);
      }
    }

    const chosen = [...groups.values()].filter((group) => this.ancestorBenefit(group.members.length, group.entries) > 0);
    const contains = (outer: Group, inner: Group) =>
      outer.members.length > inner.members.length && inner.members.every((index) => outer.members.includes(index));
    const smallest = (list: Group[]) => list.filter((group) => !list.some((other) => contains(group, other)));
    // Create larger sets first, so the ancestors a set spreads exist before it.
    chosen.sort((left, right) => right.members.length - left.members.length);
    for (const group of chosen) {
      const parents = smallest(chosen.filter((other) => contains(other, group))).map((parent) => parent.node!);
      const content = new Map<string, ValueNode>(parents.flatMap((parent) => parent.entries!));
      for (const [key, value] of group.entries) {
        content.set(key, value);
      }
      const node = this.objectNode([...content], undefined, []);
      if (!node.spreads && parents.length > 0) {
        node.spreads = parents;
        node.own = group.entries;
      }
      node.ancestor ??= { family, roots: group.members.flatMap((index) => members[index].roots), path };
      group.node = node;
    }
    members.forEach(({ node }, index) => {
      const required = chosen.filter((group) => group.members.includes(index));
      if (required.length === 0 || required.some((group) => group.node === node)) {
        return;
      }
      const covered = new Set(required.flatMap((group) => group.entries.map(([key]) => key)));
      node.spreads = smallest(required).map((group) => group.node!);
      node.own = node.entries!.filter(([key]) => !covered.has(key));
    });
  }

  /** Bytes saved by emitting entries that `count` objects share once, in an ancestor the objects spread. */
  private ancestorBenefit(count: number, entries: readonly Entry[]): number {
    const identifierSize = this._identifierSize;
    let size = 0;
    for (const [key, value] of entries) {
      size += keySize(key) + 2 + Math.min(this.canonicalSize(value), identifierSize);
    }
    // The ancestor costs a declaration and braces; each object spreads it.
    return (count - 1) * size - (identifierSize + 4) - count * (identifierSize + 4);
  }

  /** Throw unless the spreads and own entries of an object reproduce exactly its entries. */
  private verifyPlan(node: ValueNode) {
    const merged = new Map<string, ValueNode>();
    const add = (source: ValueNode) => {
      for (const spread of source.spreads ?? []) {
        add(spread);
      }
      for (const [key, value] of source.spreads ? source.own! : source.entries!) {
        if ((merged.get(key) ?? value) !== value) {
          throw new Error(`Ancestors of ${formatPath(node.path)} disagree on ${key}.`);
        }
        merged.set(key, value);
      }
    };
    add(node);
    const lookup = node.lookup!;
    if (merged.size !== lookup.size || [...merged].some(([key, value]) => lookup.get(key) !== value)) {
      throw new Error(`Ancestors of ${formatPath(node.path)} do not reproduce it.`);
    }
  }

  private canonicalSize(node: ValueNode): number {
    let size = this._canonicalSizes.get(node);
    if (size === undefined) {
      size = this.contentSize(node, (child) => this.canonicalSize(child), false);
      this._canonicalSizes.set(node, size);
    }
    return size;
  }

  /** Minified size of a value, given the size of each child reference. */
  private contentSize(node: ValueNode, childSize: (child: ValueNode) => number, usePlan: boolean): number {
    switch (node.kind) {
      case 'literal':
        return literalSize(node.literal);
      case 'expression':
        return expressionSize(node.expression!, this._identifierSize);
      case 'array': {
        const items = node.items!;
        return items.reduce((size, item) => size + childSize(item), 1 + Math.max(items.length, 1));
      }
      default: {
        const spreads = usePlan ? (node.spreads ?? []) : [];
        const entries = usePlan && node.spreads ? node.own! : node.entries!;
        const parts = spreads.length + entries.length;
        const size = 1 + Math.max(parts, 1) + spreads.length * (3 + this._identifierSize);
        return entries.reduce((total, [key, value]) => total + keySize(key) + 1 + childSize(value), size);
      }
    }
  }

  private resolve(): string {
    if (this._output !== undefined) {
      return this._output;
    }
    if (this._ancestors) {
      this.extractFamilies();
    }
    for (const node of this._nodes.values()) {
      if (node.spreads) {
        this.verifyPlan(node);
      }
    }
    const heights = new Map<ValueNode, number>();
    const visit = (node: ValueNode): number => {
      let height = heights.get(node);
      if (height === undefined) {
        height = Math.max(-1, ...children(node).map(visit)) + 1;
        heights.set(node, height);
      }
      return height;
    };
    this._declarations.forEach(({ node }) => visit(node));
    // Parents before children.
    const nodes = [...heights.keys()].sort((left, right) => heights.get(right)! - heights.get(left)! || left.id - right.id);

    // The first declaration of a value emits it, and later declarations reference it. A value declared with different
    // types is emitted as a constant that every declaration references, so each declaration checks its own type.
    const owners = new Map<ValueNode, Declaration>();
    const detached = new Set<ValueNode>();
    for (const declaration of this._declarations) {
      const owner = owners.get(declaration.node);
      if (!owner) {
        owners.set(declaration.node, declaration);
      } else if (owner.options.type !== declaration.options.type || owner.options.satisfies !== declaration.options.satisfies) {
        detached.add(declaration.node);
      }
    }
    detached.forEach((node) => owners.delete(node));
    const forced = new Set(nodes.filter((node) => node.ancestor || owners.has(node) || detached.has(node)));
    const aliases = this._declarations.filter((declaration) => owners.get(declaration.node) !== declaration).length;

    const declared = this.chooseDeclared(nodes, forced, aliases);
    const groups = this.assignNames(nodes, declared, owners);
    this._output = this.render(nodes, heights, declared, owners, groups);
    return this._output;
  }

  /**
   * Choose the values to declare. Parents are decided before their children, because a declared parent emits its
   * children once. Each pass measures values with the previous pass's choices, and the smallest result wins.
   */
  private chooseDeclared(nodes: readonly ValueNode[], forced: ReadonlySet<ValueNode>, aliases: number): Set<ValueNode> {
    const identifierSize = this._identifierSize;
    let sizes = this.measure(nodes, forced);
    let best: { declared: Set<ValueNode>; size: number } | undefined;
    let previous: Set<ValueNode> | undefined;
    for (let pass = 0; pass < maxHoistingPasses; pass++) {
      const counts = new Map<ValueNode, number>();
      this._declarations.forEach(({ node }) => counts.set(node, (counts.get(node) ?? 0) + 1));
      const declared = new Set(forced);
      for (const node of nodes) {
        const count = counts.get(node) ?? 0;
        const size = sizes.get(node)!;
        const hoistable = node.kind !== 'literal' || typeof node.literal === 'string';
        if (hoistable && !declared.has(node) && count * size > size + identifierSize + 2 + count * identifierSize) {
          declared.add(node);
        }
        const emitted = declared.has(node) ? 1 : count;
        for (const child of children(node)) {
          counts.set(child, (counts.get(child) ?? 0) + emitted);
        }
      }
      sizes = this.measure(nodes, declared);
      let size = aliases * (2 * identifierSize + 2);
      declared.forEach((node) => (size += identifierSize + 2 + sizes.get(node)!));
      if (!best || size < best.size) {
        best = { declared, size };
      }
      if (previous?.size === declared.size && [...declared].every((node) => previous!.has(node))) {
        break;
      }
      previous = declared;
    }
    this._size = best!.size;
    return best!.declared;
  }

  /** Minified size of each value, children first, where declared children cost a reference. */
  private measure(nodes: readonly ValueNode[], declared: ReadonlySet<ValueNode>): Map<ValueNode, number> {
    const sizes = new Map<ValueNode, number>();
    for (let index = nodes.length - 1; index >= 0; index--) {
      const node = nodes[index];
      sizes.set(
        node,
        this.contentSize(node, (child) => (declared.has(child) ? this._identifierSize : sizes.get(child)!), true),
      );
    }
    return sizes;
  }

  /** Name every declared value and return the group each hoisted value is listed with. */
  private assignNames(nodes: readonly ValueNode[], declared: ReadonlySet<ValueNode>, owners: ReadonlyMap<ValueNode, Declaration>) {
    const names = new Map<ValueNode, string>();
    const taken = new Set([...this._reserved, ...this._declarations.map(({ name }) => name)]);
    for (const node of nodes) {
      if (node.expression) {
        scanCode(
          node.expression.code,
          (name, isProperty) => !isProperty && taken.add(name),
          () => undefined,
        );
      }
    }
    owners.forEach((declaration, node) => names.set(node, declaration.name));
    const unique = (base: string) => {
      let name = base;
      for (let index = 2; taken.has(name); index++) {
        name = `${base}${index}`;
      }
      taken.add(name);
      return name;
    };
    const pending = nodes.filter((node) => declared.has(node) && !names.has(node)).sort((left, right) => left.id - right.id);
    const groups = new Map<ValueNode, string>();
    const byBase = new Map<string, ValueNode[]>();
    for (const node of pending) {
      if (node.ancestor) {
        names.set(node, unique(ancestorName(node.ancestor)));
      } else {
        const base = this.baseName(node);
        const list = byBase.get(base);
        if (list) {
          list.push(node);
        } else {
          byBase.set(base, [node]);
        }
        groups.set(node, base);
      }
    }
    for (const [base, list] of byBase) {
      if (list.length === 1 && !taken.has(base)) {
        names.set(list[0], unique(base));
        continue;
      }
      let index = 1;
      for (const node of list) {
        while (taken.has(`${base}${index}`)) {
          index++;
        }
        names.set(node, unique(`${base}${index}`));
      }
    }
    this._names = names;
    return groups;
  }

  private baseName(node: ValueNode): string {
    const custom = this._name?.(node.source, node.path);
    if (custom) {
      return toIdentifier(custom);
    }
    if (typeof node.literal === 'string') {
      if (hexColorPattern.test(node.literal)) {
        return `rgb${node.literal.slice(1)}`;
      }
      if (wordPattern.test(node.literal)) {
        return toIdentifier(node.literal);
      }
    }
    if (node.expression?.name) {
      return toIdentifier(node.expression.name);
    }
    for (let index = node.path.length - 1; index > 0; index--) {
      const segment = node.path[index];
      if (typeof segment === 'string') {
        return toIdentifier(segment);
      }
    }
    return node.path.length === 1 ? `${node.path[0]}Value` : 'value';
  }

  private render(
    nodes: readonly ValueNode[],
    heights: ReadonlyMap<ValueNode, number>,
    declared: ReadonlySet<ValueNode>,
    owners: ReadonlyMap<ValueNode, Declaration>,
    groups: ReadonlyMap<ValueNode, string>,
  ): string {
    const items: Item[] = [];
    const emitters = new Map<ValueNode, Item>();
    for (const node of nodes) {
      if (declared.has(node) && !owners.has(node)) {
        // Hoisted values are listed in blocks by kind and height: strings and expressions by name, then arrays and
        // objects by base name and first occurrence. Ancestors follow, then the declarations.
        const height = heights.get(node)!;
        const kind = node.kind === 'literal' || node.kind === 'expression' ? node.kind : 'value';
        const order = kind === 'value' ? [groups.get(node)!, node.id] : [this._names.get(node)!];
        const rank = node.ancestor ? [1, height, node.id] : [0, height, kind, ...order];
        const item: Item = { node, rank, group: `${kind}:${height}`, dependencies: [] };
        emitters.set(node, item);
        items.push(item);
      }
    }
    for (const declaration of this._declarations) {
      const item: Item = { node: declaration.node, declaration, rank: [2, declaration.index], group: 'declaration', dependencies: [] };
      if (owners.get(declaration.node) === declaration) {
        emitters.set(declaration.node, item);
      }
      items.push(item);
    }
    for (const item of items) {
      const emits = emitters.get(item.node) === item;
      item.dependencies = (emits ? this.references(item.node, declared) : [item.node]).map((node) => emitters.get(node)!);
    }

    // Emit in rank order, holding each item until the items it references are emitted.
    const emitted = new Set<Item>();
    let text = '';
    let previous: { group: string; multiline: boolean } | undefined;
    while (emitted.size < items.length) {
      let next: Item | undefined;
      for (const item of items) {
        if (
          !emitted.has(item) &&
          item.dependencies.every((dependency) => emitted.has(dependency)) &&
          (!next || compareRank(item.rank, next.rank) < 0)
        ) {
          next = item;
        }
      }
      if (!next) {
        throw new Error('Declarations reference each other circularly.');
      }
      emitted.add(next);
      const code = next.declaration ? this.renderDeclaration(next.declaration, owners) : this.renderConstant(next.node);
      const multiline = code.includes('\n');
      if (previous) {
        text += multiline || previous.multiline || previous.group !== next.group ? '\n\n' : '\n';
      }
      text += code;
      previous = { group: next.group, multiline };
    }
    return text ? `${text}\n` : '';
  }

  /** Declared values that the emitted form of a value references. */
  private references(node: ValueNode, declared: ReadonlySet<ValueNode>): ValueNode[] {
    const found = new Set<ValueNode>();
    const visit = (current: ValueNode) => {
      for (const child of children(current)) {
        if (declared.has(child)) {
          found.add(child);
        } else {
          visit(child);
        }
      }
    };
    visit(node);
    return [...found];
  }

  private renderConstant(node: ValueNode): string {
    const prefix = `const ${this._names.get(node)} = `;
    const suffix = this._constAssertions && (node.kind === 'array' || node.kind === 'object') ? ' as const' : '';
    return `${prefix}${this.format(node, 0, prefix.length, suffix.length + 1, Boolean(node.ancestor), node)}${suffix};`;
  }

  private renderDeclaration(declaration: Declaration, owners: ReadonlyMap<ValueNode, Declaration>): string {
    const { name, node, options } = declaration;
    const prefix = `${options.exported === false ? '' : 'export '}const ${name}${options.type ? `: ${options.type}` : ''} = `;
    const suffix = options.satisfies ? ` satisfies ${options.satisfies}` : '';
    const value =
      owners.get(node) === declaration ? this.format(node, 0, prefix.length, suffix.length + 1, true, node) : this._names.get(node);
    const comment = options.comment ? `${writeDocComment(options.comment)}\n` : '';
    return `${comment}${prefix}${value}${suffix};`;
  }

  /**
   * Format a value that starts at `column` and is followed by `trailing` characters. Arrays and objects stay on one line
   * when they fit, unless `multiline` is set. `self` is the value being declared, which is expanded rather than named.
   */
  private format(node: ValueNode, depth: number, column: number, trailing: number, multiline: boolean, self?: ValueNode): string {
    const inline = this.inline(node, self);
    const parts = this.parts(node, self);
    if (!parts || parts.length === 0 || (!multiline && column + inline.length + trailing <= this._printWidth)) {
      return inline;
    }
    const indent = '  '.repeat(depth + 1);
    const lines = parts.map(([key, value]) => {
      if (!value) {
        return `${indent}${key},`;
      }
      const prefix = key === undefined ? indent : `${indent}${propertyKey(key)}: `;
      return `${prefix}${this.format(value, depth + 1, prefix.length, 1, false)},`;
    });
    const [open, close] = node.kind === 'array' ? ['[', ']'] : ['{', '}'];
    return `${open}\n${lines.join('\n')}\n${'  '.repeat(depth)}${close}`;
  }

  private inline(node: ValueNode, self?: ValueNode): string {
    const parts = this.parts(node, self);
    if (!parts) {
      return node !== self && this._names.has(node)
        ? this._names.get(node)!
        : node.expression
          ? expressionCode(node.expression)
          : literalCode(node.literal);
    }
    const text = parts.map(([key, value]) => {
      const code = value ? this.inline(value) : '';
      return key === undefined ? code : value ? `${propertyKey(key)}: ${code}` : key;
    });
    if (node.kind === 'array') {
      return `[${text.join(', ')}]`;
    }
    return text.length > 0 ? `{ ${text.join(', ')} }` : '{}';
  }

  /**
   * The parts of an array or object to emit, or undefined for a reference or a scalar. A part with a key and no value
   * is a spread or shorthand property, emitted as the key.
   */
  private parts(node: ValueNode, self?: ValueNode): [key: string | undefined, value: ValueNode | undefined][] | undefined {
    if ((node !== self && this._names.has(node)) || (node.kind !== 'array' && node.kind !== 'object')) {
      return undefined;
    }
    if (node.kind === 'array') {
      return node.items!.map((item) => [undefined, item]);
    }
    const spreads = (node.spreads ?? []).map((spread): [string, undefined] => [`...${this._names.get(spread)}`, undefined]);
    const entries = (node.spreads ? node.own! : node.entries!).map(([key, value]): [string, ValueNode | undefined] =>
      this._names.get(value) === key ? [key, undefined] : [key, value],
    );
    return [...spreads, ...entries];
  }
}

function children(node: ValueNode): readonly ValueNode[] {
  if (node.kind === 'array') {
    return node.items!;
  }
  if (node.kind !== 'object') {
    return [];
  }
  return [...(node.spreads ?? []), ...(node.spreads ? node.own! : node.entries!).map(([, value]) => value)];
}
