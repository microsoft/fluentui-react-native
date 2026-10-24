import fs from 'node:fs';
import path from 'node:path';

import { fontFamilyBase, fontFamilyMonospace } from '../../tokens/global.generated';
import type { ColorTone, NormalizedThemeAppearance } from '../../types/appearance.types';
import { selectColorEntry } from '../colors/flexColor';
import { deriveInteractionColor, resolveFlexTokenDescription } from '../colors/interactionPolicy';
import { isInteractiveColorToken } from '../colors/interactiveTokens';
import type { FlexShadow, FlexTokenDescription, FlexTokens } from '../tokens.types';
import { getDefaultFlexTokenDescription } from './defaultTokens';

type MappingEntry = { genericSource?: string };
type MappingChecks = {
  loadMappingInputs(): { mapping: unknown; supportedTypePaths: Set<string>; unsupportedTypePaths: Set<string> };
  createMappingProjections(mapping: unknown, supportedTypePaths: Set<string>): { mappingEntries: Map<string, MappingEntry> };
};

const { createMappingProjections, loadMappingInputs } = jest.requireActual<MappingChecks>(
  '../../../scripts/token-mappings/check-mappings.cjs',
);
const mappingInputs = loadMappingInputs();
const { mappingEntries } = createMappingProjections(mappingInputs.mapping, mappingInputs.supportedTypePaths);

// These checks read the pinned split light and dark snapshots, not the adaptive
// sources the generator reads, and convert values without generator code.
const fixtureRoot = path.resolve(__dirname, '../../../scripts/token-mappings/__fixtures__/x3');
const toneDirectories: Record<ColorTone, string> = { cool: '', warm: 'warm' };
const tones = ['cool', 'warm'] as const;
const schemes = ['light', 'dark'] as const;
type Scheme = (typeof schemes)[number];

// Algorithm parameters the interaction engine owns; they are not Flex destinations.
const engineParameters = [
  '--alpha-hover',
  '--alpha-press',
  '--interaction-inverse-hover',
  '--interaction-inverse-pressed',
  '--interaction-standard-hover',
  '--interaction-standard-pressed',
  '--lightness-hover',
  '--lightness-press',
];

// x3 variable font weights and the static native weights that represent them.
const nativeFontWeights: Record<string, string> = { '420': '400', '550': '500', '600': '600', '625': '700' };

type Sources = { semantic: Map<string, string>; fallback: Map<string, string> };

function readDeclarations(file: string): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const text = line.trim();
    if (!text.startsWith('--')) {
      continue;
    }
    if (!text.endsWith(';')) {
      throw new Error(`Expected a single-line declaration in ${file}: ${text}`);
    }
    const colon = text.indexOf(':');
    declarations.set(text.slice(0, colon), text.slice(colon + 1, -1).trim());
  }
  return declarations;
}

const sourceCache = new Map<string, Sources>();

function readSources(tone: ColorTone, scheme: Scheme): Sources {
  const key = `${tone}:${scheme}`;
  let sources = sourceCache.get(key);
  if (!sources) {
    const directory = path.join(fixtureRoot, toneDirectories[tone]);
    sources = {
      semantic: readDeclarations(path.join(directory, `semantic-${scheme}.css`)),
      fallback: readDeclarations(path.join(directory, `interaction-fallback-${scheme}.css`)),
    };
    sourceCache.set(key, sources);
  }
  return sources;
}

function genericSource(tokenPath: string): string {
  const source = mappingEntries.get(tokenPath)?.genericSource;
  if (!source) {
    throw new Error(`${tokenPath} has no generic source.`);
  }
  return source;
}

function read(declarations: Map<string, string>, name: string): string {
  const value = declarations.get(name);
  if (value === undefined) {
    throw new Error(`${name} is not declared.`);
  }
  return value;
}

function normalizeColor(value: unknown): string {
  if (typeof value !== 'string' || !/^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) {
    return `<not a hex color: ${String(value)}>`;
  }
  const hex = value.toLowerCase();
  return hex.length === 7 ? `${hex}ff` : hex;
}

function pixels(value: string): number {
  if (value.endsWith('rem')) {
    return Number(value.slice(0, -3)) * 16;
  }
  if (value.endsWith('px')) {
    return Number(value.slice(0, -2));
  }
  throw new Error(`Expected px or rem: ${value}`);
}

function functionArguments(value: string, name: string): string[] {
  if (!value.startsWith(`${name}(`) || !value.endsWith(')')) {
    throw new Error(`Expected ${name}(): ${value}`);
  }
  return value
    .slice(name.length + 1, -1)
    .split(',')
    .map((part) => part.trim());
}

// CSS round(P%, Spx) against the role's font size; ties round up, as Math.round does.
function lineHeight(value: string, fontSize: number): number {
  if (value.endsWith('px')) {
    return pixels(value);
  }
  const [percent, step] = functionArguments(value, 'round');
  if (!percent.endsWith('%')) {
    throw new Error(`Expected a percentage line height: ${value}`);
  }
  const interval = pixels(step);
  return Math.round((fontSize * Number(percent.slice(0, -1))) / 100 / interval) * interval;
}

function duration(value: string): number {
  if (value.endsWith('ms')) {
    return Number(value.slice(0, -2));
  }
  if (value.endsWith('s')) {
    return Number(value.slice(0, -1)) * 1000;
  }
  throw new Error(`Expected a duration: ${value}`);
}

function fontFamily(value: string): unknown {
  const generic = value.split(',').at(-1)?.trim();
  if (generic === 'monospace') {
    return fontFamilyMonospace;
  }
  if (generic === 'sans-serif' || generic === 'serif') {
    return fontFamilyBase;
  }
  throw new Error(`Unexpected generic family: ${value}`);
}

// The fallback stylesheets resolve shadow colors to hex for non-OKLCH engines.
function shadow(value: string): FlexShadow {
  return value.split(',').map((layer) => {
    const [x, y, blur, color] = layer.trim().split(/\s+/);
    return { x: pixels(x), y: pixels(y), blur: pixels(blur), color };
  });
}

function expectedValue(group: string, token: string, sources: Sources): unknown {
  const source = read(sources.semantic, genericSource(`${group}.${token}`));
  switch (group) {
    case 'fontWeight':
      return nativeFontWeights[source] ?? `<no native weight for ${source}>`;
    case 'fontFamily':
      return fontFamily(source);
    case 'lineHeight':
      return lineHeight(source, pixels(read(sources.semantic, genericSource(`fontSize.${token}`))));
    case 'motion':
      return source.startsWith('cubic-bezier(') ? functionArguments(source, 'cubic-bezier').map(Number) : duration(source);
    case 'shadow':
      return shadow(read(sources.fallback, genericSource(`shadow.${token}`)));
    default:
      return pixels(source);
  }
}

function appearance(colorTone: ColorTone, colorScheme: Scheme): NormalizedThemeAppearance {
  return { colorScheme, contrast: 'standard', interfaceLevel: 'base', colorTone };
}

function colorMismatches(tokens: FlexTokens, sources: Sources): string[] {
  const mismatches: string[] = [];
  for (const [token, color] of Object.entries(tokens.color)) {
    const restSource = genericSource(`color.${token}.rest`);
    const expectedRest = normalizeColor(read(sources.semantic, restSource));
    if (normalizeColor(color.rest) !== expectedRest) {
      mismatches.push(`color.${token}.rest: ${String(color.rest)} != ${expectedRest}`);
    }
    for (const state of ['hover', 'pressed'] as const) {
      if (!isInteractiveColorToken(token)) {
        if (color[state] !== color.rest || sources.fallback.has(`${restSource}-${state}`)) {
          mismatches.push(`color.${token}.${state}: a non-interactive state must equal rest`);
        }
        continue;
      }
      const expected = normalizeColor(read(sources.fallback, genericSource(`color.${token}.${state}`)));
      if (normalizeColor(color[state]) !== expected) {
        mismatches.push(`color.${token}.${state}: ${String(color[state])} != ${expected}`);
      }
    }
  }
  return mismatches;
}

function explicitStates(description: FlexTokenDescription): [token: string, state: 'hover' | 'pressed'][] {
  return Object.entries(description.color).flatMap(([token, color]) =>
    (['hover', 'pressed'] as const).filter((state) => color[state] !== undefined).map((state) => [token, state] as [string, typeof state]),
  );
}

describe('x3 Flex defaults', () => {
  describe.each(tones)('%s tone', (tone) => {
    const description = getDefaultFlexTokenDescription(tone);

    it.each(schemes)('resolves every %s color to the pinned source values', (scheme) => {
      const tokens = resolveFlexTokenDescription(description, appearance(tone, scheme));

      expect(colorMismatches(tokens, readSources(tone, scheme))).toEqual([]);
    });

    it.each(schemes)('resolves every %s non-color value to the pinned source values', (scheme) => {
      const tokens = resolveFlexTokenDescription(description, appearance(tone, scheme));
      const sources = readSources(tone, scheme);

      for (const [group, values] of Object.entries(tokens)) {
        if (group === 'color') {
          continue;
        }
        for (const [token, value] of Object.entries(values as Record<string, unknown>)) {
          expect([`${group}.${token}`, value]).toEqual([`${group}.${token}`, expectedValue(group, token, sources)]);
        }
      }
    });

    it('authors an interaction state only when the policy cannot reproduce its source', () => {
      for (const [token, state] of explicitStates(description)) {
        const color = description.color[token as keyof typeof description.color];
        const direction = color.type === 'inverted' ? 'inverted' : 'standard';
        const reproduced = schemes.every((scheme) => {
          const resolvedAppearance = appearance(tone, scheme);
          const rest = selectColorEntry(color.rest, resolvedAppearance);
          const derived = deriveInteractionColor(
            rest,
            token as Parameters<typeof deriveInteractionColor>[1],
            state,
            direction,
            resolvedAppearance,
          );
          return normalizeColor(derived) === normalizeColor(selectColorEntry(color[state] as never, resolvedAppearance));
        });

        expect([token, state, reproduced]).toEqual([token, state, false]);
      }
    });

    it.each(schemes)('maps every %s source variable to a Flex destination', (scheme) => {
      const declared = new Set([...mappingEntries.values()].map((entry) => entry.genericSource));
      const { semantic, fallback } = readSources(tone, scheme);
      const names = [...semantic.keys(), ...fallback.keys()];

      expect(names.filter((name) => name.startsWith('--gnrc-') && !declared.has(name))).toEqual([]);
      expect([...new Set(names.filter((name) => !name.startsWith('--gnrc-')))].sort()).toEqual(engineParameters);
    });
  });
});
