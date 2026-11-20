import type { ThemeState } from '../flex/themeState.types';
import type { FlexTokens, InteractiveColor } from '../flex/tokens.types';
import type {
  ComponentTokenContext,
  ResolvedSlotTokens,
  TokenAxes,
  TokenFields,
  TokenMember,
  TokenSlotDomains,
} from './componentTokens.types';

type Parser = TokenFields[string];
type Condition = readonly [axis: number, member: TokenMember];
type ColorMember = keyof InteractiveColor | 'active';
type Reference = { group: keyof FlexTokens; name: string; member?: ColorMember };
type Field = { key: string; output: 'style' | 'props'; parse: Parser; path: string };
type Binding = Field & ({ reference: Reference } | { literal: unknown } | { asset: () => unknown });
type Rule = { conditions: readonly Condition[]; fields: readonly Binding[] };
type Rules = ReadonlyMap<string, readonly Rule[]>;
type ValueReader = (state: readonly TokenMember[]) => unknown;

const groups = {
  color: true,
  shadow: true,
  fontWeight: true,
  fontFamily: true,
  fontSize: true,
  lineHeight: true,
  borderRadius: true,
  spacing: true,
  strokeWidth: true,
  motion: true,
} satisfies Record<keyof FlexTokens, true>;

const forbidden = new Set(['constructor', 'prototype', '__proto__']);

function invalid(path: string, problem: string): never {
  throw new TypeError(`${path}: ${problem}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
    invalid(path, 'expected a plain object');
  }
  return value as Record<string, unknown>;
}

function ownValue(object: object, key: PropertyKey, path: string): unknown {
  const entry = Object.getOwnPropertyDescriptor(object, key);
  if (entry && !Object.hasOwn(entry, 'value')) {
    invalid(path, 'accessors are not supported');
  }
  return entry?.value;
}

function parseReference(value: string, path: string, visualAxis: number): Reference {
  const [group, name, member, ...extra] = value.slice('tokens:'.length).split('.');
  if (
    !Object.hasOwn(groups, group) ||
    !name ||
    forbidden.has(name) ||
    extra.length ||
    (group === 'color' ? !['rest', 'hover', 'pressed', 'active'].includes(member) : member !== undefined)
  ) {
    invalid(path, `invalid Flex reference "${value}"`);
  }
  if (member === 'active' && visualAxis < 0) {
    invalid(path, 'active colors require a visualState axis');
  }
  return { group: group as keyof FlexTokens, name, member: member as ColorMember | undefined };
}

function compileLayer(
  input: unknown,
  domains: TokenSlotDomains,
  selectors: ReadonlyMap<string, Condition>,
  visualAxis: number,
  label: string,
  defaults: boolean,
): Rules {
  const layer = record(input, label);
  const slots = new Map<string, Rule[]>();
  const issues: string[] = [];
  const assetProtocols = new Set(
    Object.values(domains).flatMap(({ style, props }) =>
      [...Object.values(style), ...Object.values(props)].flatMap((field) => (typeof field === 'function' ? [] : [field.protocol])),
    ),
  );

  function walk(node: unknown, path: string, domain: TokenSlotDomains[string], conditions: Condition[], rules: Rule[]) {
    const fields: Binding[] = [];
    for (const key of Object.keys(record(node, path))) {
      const fieldPath = `${path}.${key}`;
      try {
        const value = ownValue(node as object, key, fieldPath);
        if (key.startsWith('when.')) {
          const selector = selectors.get(key);
          if (!selector || (conditions.length && selector[0] <= conditions[conditions.length - 1][0])) {
            invalid(fieldPath, 'unknown, repeated, or out-of-order selector');
          }
          walk(value, fieldPath, domain, [...conditions, selector], rules);
        } else {
          const output = Object.hasOwn(domain.style, key) ? 'style' : 'props';
          if (forbidden.has(key) || !Object.hasOwn(domain[output], key)) {
            invalid(fieldPath, 'unknown token field');
          }
          if (value !== undefined) {
            const field = { key, output, parse: domain[output][key], path: fieldPath } as const;
            const protocol = typeof value === 'string' ? value.slice(0, value.indexOf(':') + 1) : '';
            if (typeof field.parse !== 'function') {
              const prefix = `${field.parse.protocol}:`;
              if (typeof value !== 'string' || protocol !== prefix) invalid(fieldPath, `expected a ${prefix} asset reference`);
              const name = value.slice(prefix.length).replace(/^ /, '');
              try {
                fields.push({ ...field, asset: field.parse.prepare(name) });
              } catch (error) {
                if (!(error instanceof TypeError)) throw error;
                invalid(fieldPath, error.message);
              }
            } else if (typeof value === 'string' && value.startsWith('tokens:')) {
              fields.push({ ...field, reference: parseReference(value, fieldPath, visualAxis) });
            } else if (assetProtocols.has(protocol.slice(0, -1))) {
              invalid(fieldPath, `unexpected ${protocol} reference`);
            } else {
              fields.push({
                ...field,
                literal: normalize(field, typeof value === 'string' && value.startsWith('literal:') ? value.slice(8) : value),
              });
            }
          }
        }
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
        issues.push(error.message);
      }
    }
    rules.push({ conditions, fields });
  }

  for (const slot of Object.keys(layer)) {
    const path = `${label}.${slot}`;
    if (forbidden.has(slot) || !Object.hasOwn(domains, slot)) {
      issues.push(`${path}: unknown slot`);
      continue;
    }
    try {
      const node = ownValue(layer, slot, path);
      if (node !== undefined) {
        const rules: Rule[] = [];
        walk(node, path, domains[slot], [], rules);
        // Highest differing axis wins. Compare matching paths from high to low.
        rules.sort((a, b) => {
          let i = a.conditions.length - 1;
          let j = b.conditions.length - 1;
          while (i >= 0 && j >= 0 && a.conditions[i][0] === b.conditions[j][0]) {
            i--;
            j--;
          }
          return (i < 0 ? -1 : a.conditions[i][0]) - (j < 0 ? -1 : b.conditions[j][0]);
        });
        slots.set(slot, rules);
      }
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      issues.push(error.message);
    }
  }
  if (defaults) {
    for (const slot of Object.keys(domains)) {
      if (!slots.has(slot)) issues.push(`${label}.${slot}: missing default slot`);
    }
  }
  if (issues.length) throw new TypeError(issues.join('\n'));
  return slots;
}

function normalize(binding: Field, value: unknown): unknown {
  if (value === null || value === undefined) invalid(binding.path, 'expected a token value');
  try {
    if (typeof binding.parse !== 'function') invalid(binding.path, 'expected an asset reference');
    return binding.parse(value);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return invalid(binding.path, error.message);
  }
}

function bindValue(binding: Binding, tokens: FlexTokens, visualAxis: number): ValueReader {
  if ('literal' in binding) return () => binding.literal;
  if ('asset' in binding) {
    return () => {
      try {
        return binding.asset();
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
        return invalid(binding.path, error.message);
      }
    };
  }
  const { group, name, member } = binding.reference;
  const path = binding.path;
  const token = ownValue(tokens[group], name, path);
  if (token === undefined) invalid(path, `unknown Flex token ${group}.${name}`);
  if (!member) {
    const value = normalize(binding, token);
    return () => value;
  }
  const color = token as InteractiveColor;
  return (state) => {
    const visualState = state[visualAxis];
    const key = member === 'active' ? (visualState === 'hovered' ? 'hover' : visualState === 'pressed' ? 'pressed' : 'rest') : member;
    return normalize(binding, color[key]);
  };
}

type BoundRule = {
  conditions: readonly Condition[];
  fields: readonly { key: string; output: 'style' | 'props'; read: ValueReader; active: boolean }[];
};

export type CompiledSlotTokens<State extends object, S extends TokenFields, P extends TokenFields> = (
  state: State,
  overrides?: Partial<State>,
) => ResolvedSlotTokens<S, P>;

export type CompiledComponentTokens<State extends object, D extends TokenSlotDomains> = {
  readonly [K in keyof D]: CompiledSlotTokens<State, D[K]['style'], D[K]['props']>;
};

export type ComponentTokenDefinition<State extends object, D extends TokenSlotDomains> = {
  readonly resolve: (theme: ThemeState) => CompiledComponentTokens<State, D>;
};

function readAxes(input: unknown, id: string): TokenAxes {
  if (!Array.isArray(input)) invalid(id, 'expected ordered axes');
  return input.map((axis, index) => {
    const path = `${id}.axes[${index}]`;
    if (!Array.isArray(axis) || axis.length !== 2) invalid(path, 'expected [field, members]');
    const [field, members] = axis as unknown[];
    if (typeof field !== 'string' || !Array.isArray(members)) invalid(path, 'expected a field name and member array');
    const values = Array.from(members, (member: unknown) => {
      if (typeof member !== 'string' && typeof member !== 'number' && typeof member !== 'boolean') {
        invalid(path, 'expected string, number, or boolean members');
      }
      return member;
    });
    return [field, values] as const;
  });
}

/** Validate a component definition, and compile its default selector paths once. */
export function defineComponentTokens<State extends object, const D extends TokenSlotDomains>(definition: {
  readonly id: `${string}.${string}`;
  readonly slots: D;
  readonly schema: { schemaVersion: number; component: string; axes: unknown; bindings: unknown };
}): ComponentTokenDefinition<State, D> {
  const { id, slots, schema } = definition;
  if (id.slice(id.lastIndexOf('.') + 1) !== schema.component) {
    invalid(id, 'component does not match the token schema');
  }
  if (schema.schemaVersion !== 2) invalid(id, 'expected schema version 2');
  const axes = readAxes(schema.axes, id);

  const selectors = new Map<string, Condition>();
  const names = new Set<string>();
  for (const [index, [field, members]] of axes.entries()) {
    if (!field || field.includes('.') || forbidden.has(field) || names.has(field) || !members.length) invalid(id, `invalid axis ${field}`);
    names.add(field);
    for (const member of members) {
      const key = `when.${field}.${member}`;
      if (
        (typeof member === 'string' && (!member || member.includes('.') || forbidden.has(member))) ||
        (typeof member === 'number' && (!Number.isFinite(member) || String(member).includes('.'))) ||
        selectors.has(key)
      ) {
        invalid(id, `invalid or ambiguous selector ${key}`);
      }
      selectors.set(key, [index, member]);
    }
  }
  for (const [slot, domain] of Object.entries(slots)) {
    for (const field of Object.keys(domain.style)) {
      if (Object.hasOwn(domain.props, field)) invalid(`${id}.${slot}.${field}`, 'field cannot be both a style and a prop');
    }
  }
  const visualAxis = axes.findIndex(([field]) => field === 'visualState');
  const defaults = compileLayer(schema.bindings, slots, selectors, visualAxis, id, true);
  const cacheKey = Symbol(id);

  return {
    resolve(theme) {
      const cached = theme.themeStyles[cacheKey] as CompiledComponentTokens<State, D> | undefined;
      if (cached) return cached;

      const context: ComponentTokenContext = { tokens: theme.tokens, appearance: theme.appearance };
      const layers = [defaults];
      for (const [index, layer] of (theme.componentTokens ?? []).entries()) {
        const path = `${id} (theme layer ${index + 1})`;
        const entry = ownValue(record(layer, path), id, path);
        const patch: unknown = typeof entry === 'function' ? entry(context) : entry;
        if (patch !== undefined) layers.push(compileLayer(patch, slots, selectors, visualAxis, path, false));
      }

      const compiled = Object.fromEntries(
        Object.keys(slots).map((slot) => {
          const rules: BoundRule[] = layers.flatMap((layer) =>
            (layer.get(slot) ?? []).map(({ conditions, fields }) => ({
              conditions,
              fields: fields.map((field) => ({
                key: field.key,
                output: field.output,
                read: bindValue(field, theme.tokens, visualAxis),
                active: 'reference' in field && field.reference.member === 'active',
              })),
            })),
          );
          const used = new Set(rules.flatMap((rule) => rule.conditions.map(([axis]) => axis)));
          if (rules.some((rule) => rule.fields.some((field) => field.active))) used.add(visualAxis);
          const relevantAxes = [...used].sort((a, b) => a - b);
          const results = new Map<string, ResolvedSlotTokens<TokenFields, TokenFields>>();
          const resolve = (state: State, overrides?: Partial<State>) => {
            const values: TokenMember[] = [];
            const signature = relevantAxes
              .map((index) => {
                const [name, members] = axes[index];
                const path = `${id}.${slot} state.${name}`;
                const value = overrides && Object.hasOwn(overrides, name) ? ownValue(overrides, name, path) : ownValue(state, name, path);
                const member = members.findIndex((candidate) => candidate === value);
                if (member < 0) invalid(path, 'not a declared axis member');
                values[index] = members[member];
                return member;
              })
              .join(',');
            const hit = results.get(signature);
            if (hit) return hit;

            const winners = new Map<string, BoundRule['fields'][number]>();
            for (const rule of rules) {
              if (rule.conditions.every(([index, member]) => values[index] === member)) {
                for (const field of rule.fields) winners.set(field.key, field);
              }
            }
            const style: Record<string, unknown> = {};
            const props: Record<string, unknown> = {};
            for (const [key, field] of winners) {
              (field.output === 'style' ? style : props)[key] = field.read(values);
            }
            const result = Object.freeze({ style: Object.freeze(style), props: Object.freeze(props) });
            results.set(signature, result);
            return result;
          };
          return [slot, resolve];
        }),
      ) as CompiledComponentTokens<State, D>;

      theme.themeStyles[cacheKey] = Object.freeze(compiled);
      return compiled;
    },
  };
}

export function getComponentTokens<State extends object, D extends TokenSlotDomains>(
  theme: ThemeState,
  definition: ComponentTokenDefinition<State, D>,
): CompiledComponentTokens<State, D> {
  return definition.resolve(theme);
}

type SlotResolver = (state: never, overrides?: never) => unknown;

export function resolveTokenStates<Slot extends SlotResolver>(slot: Slot, ...[state, overrides]: Parameters<Slot>): ReturnType<Slot> {
  return slot(state, overrides) as ReturnType<Slot>;
}
