// Generates the x3 Flex token defaults and their coverage ledger from the pinned x3 snapshots.
//
//   node ./scripts/flex-defaults/generate-defaults.mjs          write the outputs
//   node ./scripts/flex-defaults/generate-defaults.mjs --check  exit 1 when an output is stale
//
// Each supported Flex destination reads the generic custom property declared in flex-token-map.yaml.
// Interaction states are omitted wherever the runtime interaction policy reproduces the source value,
// so the generator imports that policy's TypeScript sources and requires Node TypeScript type stripping.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as nodeModule from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '../..');
const outputPaths = {
  defaults: path.join(packageRoot, 'src/flex/defaults/defaultTokens.generated.ts'),
  ledger: path.join(scriptDir, 'coverage.generated.json'),
};
const pinPath = path.join(packageRoot, 'src/tokens/mappings/upstream-pin.json');
const globalTokensPath = path.join(packageRoot, 'src/tokens/global.generated.ts');
const mappingPath = 'src/tokens/mappings/flex-token-map.yaml';
const generatorPath = 'scripts/flex-defaults/generate-defaults.mjs';
const printWidth = 140;

if (typeof nodeModule.registerHooks !== 'function' || !process.features.typescript) {
  throw new Error(`${generatorPath} requires Node 22.18 or later with TypeScript type stripping; found ${process.version}.`);
}

const scriptExtension = /\.[cm]?[jt]sx?$/;
// Package sources use extensionless relative imports, which Node ESM does not resolve.
nodeModule.registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !scriptExtension.test(specifier) &&
      context.parentURL?.endsWith('.ts')
    ) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const require = nodeModule.createRequire(import.meta.url);
const { createMappingProjections, loadMappingInputs } = require('../token-mappings/check-mappings.cjs');
const { getInteractionColor } = await import(pathToFileURL(path.join(packageRoot, 'src/color-lib/interaction.ts')).href);
const { getInteractionCompositing, getInteractionDirection, isInteractiveColorToken } = await import(
  pathToFileURL(path.join(packageRoot, 'src/flex/colors/interactiveTokens.ts')).href
);

const tones = [
  { name: 'cool', exportName: 'coolFlexTokenInput', semantic: 'semanticCss', fallback: 'interactionFallbackCss' },
  { name: 'warm', exportName: 'warmFlexTokenInput', semantic: 'warmSemanticCss', fallback: 'warmInteractionFallbackCss' },
];
const schemes = ['light', 'dark'];
const interactionStates = ['hover', 'pressed'];

// CSS parsing. Every scan is linear; no regular expression runs over source text.

function stripComments(text) {
  let result = '';
  let index = 0;
  while (index < text.length) {
    const start = text.indexOf('/*', index);
    if (start === -1) {
      return result + text.slice(index);
    }
    const end = text.indexOf('*/', start + 2);
    if (end === -1) {
      throw new Error('Unterminated CSS comment.');
    }
    result += text.slice(index, start);
    index = end + 2;
  }
  return result;
}

function parseRules(text) {
  const rules = [];
  let depth = 0;
  let selectorStart = 0;
  let bodyStart = 0;
  let selector = '';
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '{') {
      if (depth === 0) {
        selector = text.slice(selectorStart, index).trim();
        bodyStart = index + 1;
      }
      depth++;
    } else if (character === '}') {
      depth--;
      if (depth < 0) {
        throw new Error('Unbalanced CSS braces.');
      }
      if (depth === 0) {
        rules.push({ selector, body: text.slice(bodyStart, index) });
        selectorStart = index + 1;
      }
    }
  }
  if (depth !== 0 || text.slice(selectorStart).trim() !== '') {
    throw new Error('Unbalanced CSS braces.');
  }
  return rules;
}

function parseDeclarations(body) {
  const declarations = new Map();
  for (const part of body.split(';')) {
    const text = part.trim();
    if (text === '') {
      continue;
    }
    const colon = text.indexOf(':');
    if (colon === -1) {
      throw new Error(`Malformed CSS declaration: ${text}`);
    }
    const name = text.slice(0, colon).trim();
    if (name.startsWith('--')) {
      declarations.set(name, text.slice(colon + 1).trim());
    }
  }
  return declarations;
}

function findClosingParenthesis(text, from) {
  let depth = 1;
  for (let index = from; index < text.length; index++) {
    if (text[index] === '(') {
      depth++;
    } else if (text[index] === ')') {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  throw new Error(`Unbalanced parentheses in CSS value: ${text}`);
}

function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '(') {
      depth++;
    } else if (character === ')') {
      depth--;
    } else if (character === separator && depth === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

function selectScheme(value, scheme) {
  const marker = 'light-dark(';
  let result = '';
  let index = 0;
  for (;;) {
    const start = value.indexOf(marker, index);
    if (start === -1) {
      return result + value.slice(index);
    }
    const argumentsStart = start + marker.length;
    const end = findClosingParenthesis(value, argumentsStart);
    const choices = splitTopLevel(value.slice(argumentsStart, end), ',');
    if (choices.length !== 2) {
      throw new Error(`light-dark() needs two values: ${value}`);
    }
    result += value.slice(index, start) + selectScheme(choices[scheme === 'dark' ? 1 : 0], scheme);
    index = end + 1;
  }
}

function sameDeclarations(left, right) {
  return left.size === right.size && [...left].every(([name, value]) => right.get(name) === value);
}

const mediaDarkSelector = '@media (prefers-color-scheme: dark)';
const knownSelectors = new Set([':root', '[data-theme="light"]', '[data-theme="dark"]', mediaDarkSelector]);

/** Read one adaptive sheet as resolved light and dark declarations. */
function readAdaptiveSheet(filePath) {
  const blocks = new Map();
  for (const { selector, body } of parseRules(stripComments(readFileSync(filePath, 'utf8')))) {
    if (!knownSelectors.has(selector) || blocks.has(selector)) {
      throw new Error(`Unexpected CSS rule "${selector}" in ${filePath}.`);
    }
    blocks.set(selector, body);
  }
  if (!blocks.has(':root')) {
    throw new Error(`Missing :root rule in ${filePath}.`);
  }

  const root = parseDeclarations(blocks.get(':root'));
  const overrides = {
    light: parseDeclarations(blocks.get('[data-theme="light"]') ?? ''),
    dark: parseDeclarations(blocks.get('[data-theme="dark"]') ?? ''),
  };
  if (blocks.has(mediaDarkSelector)) {
    const media = parseRules(blocks.get(mediaDarkSelector));
    if (media.length !== 1 || media[0].selector !== ':root' || !sameDeclarations(parseDeclarations(media[0].body), overrides.dark)) {
      throw new Error(`The prefers-color-scheme dark rule in ${filePath} must equal its [data-theme="dark"] rule.`);
    }
  }

  const sheet = {};
  for (const scheme of schemes) {
    const declarations = new Map();
    for (const [name, value] of new Map([...root, ...overrides[scheme]])) {
      declarations.set(name, selectScheme(value, scheme));
    }
    sheet[scheme] = declarations;
  }
  return sheet;
}

// Value conversion.

const hexColorPattern = /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/;

function parseHexColor(value, source) {
  if (!hexColorPattern.test(value)) {
    throw new Error(`${source} must be a lowercase #rrggbb or #rrggbbaa color; found "${value}".`);
  }
  return value;
}

function normalizeHex(value) {
  const lower = String(value).toLowerCase();
  return lower.length === 9 && lower.endsWith('ff') ? lower.slice(0, 7) : lower;
}

function parseNumber(text, source) {
  const value = Number(text);
  if (text.trim() === '' || !Number.isFinite(value)) {
    throw new Error(`${source} has a non-numeric value "${text}".`);
  }
  return value;
}

function parseUnit(value, unit, source) {
  if (!value.endsWith(unit)) {
    throw new Error(`${source} must use ${unit}; found "${value}".`);
  }
  return parseNumber(value.slice(0, -unit.length), source);
}

function parsePixels(value, source) {
  return value.endsWith('rem') ? parseUnit(value, 'rem', source) * 16 : parseUnit(value, 'px', source);
}

function parseFunction(value, name, source) {
  const prefix = `${name}(`;
  if (!value.startsWith(prefix) || !value.endsWith(')')) {
    throw new Error(`${source} must be ${name}(); found "${value}".`);
  }
  return splitTopLevel(value.slice(prefix.length, -1), ',');
}

function parseShadowColor(value, declarations, source) {
  const prefix = 'oklch(from var(';
  if (!value.startsWith(prefix)) {
    return parseHexColor(value, source);
  }
  if (!value.endsWith(')')) {
    throw new Error(`${source} has an unsupported shadow color "${value}".`);
  }
  const inner = value.slice(prefix.length, -1);
  const close = inner.indexOf(')');
  const channels = inner.slice(close + 1).trim();
  const channelPrefix = 'l c h / ';
  if (close === -1 || !channels.startsWith(channelPrefix) || !channels.endsWith('%')) {
    throw new Error(`${source} may only change the alpha of a relative shadow color; found "${value}".`);
  }
  const baseName = inner.slice(0, close);
  const base = normalizeHex(parseHexColor(declarations.get(baseName) ?? '', `${source} base ${baseName}`));
  if (base.length !== 7) {
    throw new Error(`${source} base ${baseName} must be opaque.`);
  }
  const alpha = Math.round((parseNumber(channels.slice(channelPrefix.length, -1), source) * 255) / 100);
  return `${base}${alpha.toString(16).padStart(2, '0')}`;
}

function parseShadow(value, declarations, source) {
  return splitTopLevel(value, ',').map((layer) => {
    const lengths = [];
    let index = 0;
    while (lengths.length < 3) {
      const end = layer.indexOf(' ', index);
      if (end === -1) {
        throw new Error(`${source} shadow layers need x, y, blur, and color; found "${layer}".`);
      }
      lengths.push(parsePixels(layer.slice(index, end), source));
      index = end + 1;
    }
    const [x, y, blur] = lengths;
    return { x, y, blur, color: parseShadowColor(layer.slice(index).trim(), declarations, source) };
  });
}

/** An identifier emitted as code rather than as a literal. */
class Raw {
  constructor(code) {
    this.code = code;
  }
}

function readFontWeights() {
  const prefix = 'export const ';
  const weights = new Map();
  for (const line of readFileSync(globalTokensPath, 'utf8').split('\n')) {
    if (line.startsWith(`${prefix}fontWeight`)) {
      const [name, value] = line.slice(prefix.length).split(' = ');
      weights.set(name, value.trim().slice(1, -2));
    }
  }
  return weights;
}

const nativeFontWeights = readFontWeights();
const fontWeightRoles = [
  ['Semibold', 600, 'fontWeightSemibold'],
  ['Regular', 420, 'fontWeightRegular'],
  ['Medium', 550, 'fontWeightMedium'],
  ['Bold', 625, 'fontWeightBold'],
];
const fontFamilies = new Map([
  ['sans-serif', ['fontFamilyBase', 'The x3 sans-serif stack uses the native platform base family.']],
  ['serif', ['fontFamilyBase', 'The x3 serif stack has no portable native serif family, so it uses the platform base family.']],
  ['monospace', ['fontFamilyMonospace', 'The x3 monospace stack uses the native platform monospace family.']],
]);

/**
 * Convert one non-color source value. Returns the native value, an optional
 * representation for values emitted as identifiers, and the ledger adaptation.
 */
function convertValue(group, token, value, context) {
  const source = `${group}.${token}`;
  switch (group) {
    case 'shadow':
      return {
        value: parseShadow(value, context.declarations, source),
        adaptation: 'Relative oklch alpha resolves to #rrggbbaa; every layer is preserved.',
      };
    case 'fontWeight': {
      const role = fontWeightRoles.find(([suffix]) => token.endsWith(suffix));
      if (!role) {
        throw new Error(`${source} has no native font weight role.`);
      }
      const [roleName, sourceWeight, identifier] = role;
      if (parseNumber(value, source) !== sourceWeight) {
        throw new Error(`${source} changed from ${sourceWeight} to ${value}; review its native weight role.`);
      }
      return {
        value: new Raw(identifier),
        representation: `${identifier} ('${nativeFontWeights.get(identifier)}')`,
        adaptation: `The x3 variable weight ${value} uses the native static ${roleName.toLowerCase()} weight.`,
      };
    }
    case 'fontFamily': {
      const families = splitTopLevel(value, ',');
      const family = fontFamilies.get(families[families.length - 1]);
      if (!family) {
        throw new Error(`${source} has an unsupported generic family in "${value}".`);
      }
      return { value: new Raw(family[0]), representation: family[0], adaptation: family[1] };
    }
    case 'fontSize':
      return {
        value: parsePixels(value, source),
        adaptation: value.endsWith('rem') ? '1rem is 16 density-independent pixels.' : 'CSS px are density-independent pixels.',
      };
    case 'lineHeight': {
      const [percentage, step] = parseFunction(value, 'round', source);
      const fontSize = context.fontSize(token);
      const stepSize = parsePixels(step, source);
      return {
        value: Math.round((fontSize * parseUnit(percentage, '%', source)) / (100 * stepSize)) * stepSize,
        adaptation: `Resolved against fontSize.${token} (${fontSize}).`,
      };
    }
    case 'borderRadius':
    case 'spacing':
    case 'strokeWidth':
      return { value: parsePixels(value, source), adaptation: 'CSS px are density-independent pixels.' };
    case 'motion':
      if (token.startsWith('duration')) {
        return {
          value: value.endsWith('ms') ? parseUnit(value, 'ms', source) : parseUnit(value, 's', source) * 1000,
          adaptation: 'Durations are milliseconds.',
        };
      }
      return {
        value: parseFunction(value, 'cubic-bezier', source).map((part) => parseNumber(part, source)),
        adaptation: 'cubic-bezier() becomes [x1, y1, x2, y2].',
      };
    default:
      throw new Error(`No conversion is defined for ${source}.`);
  }
}

// Resolution.

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function schemeEntry(light, dark) {
  return sameValue(light, dark) ? light : [light, dark];
}

function readSource(sheet, scheme, name, source) {
  const value = sheet[scheme].get(name);
  if (value === undefined) {
    throw new Error(`${source} reads ${name}, which the ${scheme} source does not declare.`);
  }
  return value;
}

function deriveState(rest, token, state, scheme, tone) {
  const result = getInteractionColor(rest, scheme, state, {
    colorTone: tone,
    direction: getInteractionDirection(token),
    compositing: getInteractionCompositing(token),
  });
  return result.status === 'derived' ? result.value : rest;
}

function getGeneric(mappingEntries, tokenPath) {
  const source = mappingEntries.get(tokenPath)?.genericSource;
  if (source === undefined) {
    throw new Error(`${tokenPath} has no generic source in ${mappingPath}.`);
  }
  return source;
}

function resolveColor(token, context) {
  const { fallback, ledger, mappingEntries, semantic, tone } = context;
  const tokenPath = `color.${token}.rest`;
  const record = ledger.entry(tokenPath);
  const source = getGeneric(mappingEntries, tokenPath);
  const rest = {};
  for (const scheme of schemes) {
    rest[scheme] = normalizeHex(parseHexColor(readSource(semantic, scheme, source, tokenPath), tokenPath));
  }
  record.source = source;
  record[tone.name] = { light: rest.light, dark: rest.dark };
  const restEntry = schemeEntry(rest.light, rest.dark);

  if (!isInteractiveColorToken(token)) {
    for (const state of interactionStates) {
      const statePath = `color.${token}.${state}`;
      if (mappingEntries.has(statePath)) {
        throw new Error(`${statePath} is mapped, but ${token} is not interactive.`);
      }
      Object.assign(ledger.entry(statePath), { state: 'rest', reason: 'non-interactive' });
    }
    return restEntry;
  }

  const type = getInteractionDirection(token);
  record.type = type;
  const description = { rest: restEntry };
  for (const state of interactionStates) {
    const statePath = `color.${token}.${state}`;
    const stateSource = getGeneric(mappingEntries, statePath);
    const values = {};
    let explicit = false;
    for (const scheme of schemes) {
      values[scheme] = normalizeHex(parseHexColor(readSource(fallback, scheme, stateSource, statePath), statePath));
      if (normalizeHex(deriveState(rest[scheme], token, state, scheme, tone.name)) !== values[scheme]) {
        explicit = true;
      }
    }
    const stateRecord = ledger.entry(statePath);
    stateRecord.source = stateSource;
    stateRecord[tone.name] = { light: values.light, dark: values.dark, state: explicit ? 'explicit' : 'computed' };
    if (explicit) {
      description[state] = schemeEntry(values.light, values.dark);
    }
  }
  if (type !== 'standard') {
    description.type = type;
  }
  return Object.keys(description).length === 1 ? restEntry : description;
}

function resolveTone(tone, inputs, mappingEntries, ledger) {
  const semantic = readAdaptiveSheet(path.join(packageRoot, inputs.pin.get(tone.semantic).snapshotPath));
  const fallback = readAdaptiveSheet(path.join(packageRoot, inputs.pin.get(tone.fallback).snapshotPath));
  const tokens = { color: {} };
  const fontSize = (scheme) => (token) => {
    const tokenPath = `fontSize.${token}`;
    return convertValue('fontSize', token, readSource(semantic, scheme, getGeneric(mappingEntries, tokenPath), tokenPath)).value;
  };

  for (const tokenPath of inputs.supportedTypePaths) {
    const [group, token, state] = tokenPath.split('.');
    if (group === 'color') {
      if (state === 'rest') {
        tokens.color[token] = resolveColor(token, { fallback, ledger, mappingEntries, semantic, tone });
      }
      continue;
    }

    const source = getGeneric(mappingEntries, tokenPath);
    const sourceValues = {};
    const converted = {};
    for (const scheme of schemes) {
      sourceValues[scheme] = readSource(semantic, scheme, source, tokenPath);
      converted[scheme] = convertValue(group, token, sourceValues[scheme], { declarations: semantic[scheme], fontSize: fontSize(scheme) });
    }
    if (group !== 'shadow' && !sameValue(converted.light.value, converted.dark.value)) {
      throw new Error(`${tokenPath} varies by scheme; only colors and shadows may.`);
    }
    const value = schemeEntry(converted.light.value, converted.dark.value);
    const record = ledger.entry(tokenPath);
    record.source = source;
    record[tone.name] = { light: sourceValues.light, dark: sourceValues.dark, native: converted.light.representation ?? value };
    record.adaptation = converted.light.adaptation;
    (tokens[group] ??= {})[token] = value;
  }

  for (const tokenPath of inputs.unsupportedTypePaths) {
    const source = getGeneric(mappingEntries, tokenPath);
    const record = ledger.entry(tokenPath);
    Object.assign(record, {
      source,
      status: 'unsupported',
      reason: 'The source is em-relative; React Native letterSpacing takes absolute points, so UnsupportedFlexTokens excludes it.',
    });
    record[tone.name] = { light: readSource(semantic, 'light', source, tokenPath), dark: readSource(semantic, 'dark', source, tokenPath) };
  }

  return tokens;
}

// Emission.

const identifierPattern = /^[A-Za-z_$][\w$]*$/;

function quote(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function propertyKey(key) {
  return identifierPattern.test(key) ? key : quote(key);
}

function isComposite(value) {
  return typeof value === 'object' && value !== null && !(value instanceof Raw);
}

function inline(value) {
  if (value instanceof Raw) {
    return value.code;
  }
  if (typeof value === 'string') {
    return quote(value);
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(inline).join(', ')}]`;
  }
  const entries = Object.entries(value);
  return entries.length === 0 ? '{}' : `{ ${entries.map(([key, item]) => `${propertyKey(key)}: ${inline(item)}`).join(', ')} }`;
}

/**
 * Format a value starting at `column`. The outermost `forcedDepth` composite
 * levels are always multiline; deeper values are inline when they fit.
 */
function format(value, depth, column, forcedDepth = 0) {
  const single = inline(value);
  if (!isComposite(value) || (forcedDepth <= 0 && column + single.length + 1 <= printWidth)) {
    return single;
  }
  const indent = '  '.repeat(depth + 1);
  const lines = Array.isArray(value)
    ? value.map((item) => `${indent}${format(item, depth + 1, indent.length, forcedDepth - 1)},`)
    : Object.entries(value).map(([key, item]) => {
        const prefix = `${indent}${propertyKey(key)}: `;
        return `${prefix}${format(item, depth + 1, prefix.length, forcedDepth - 1)},`;
      });
  const [open, close] = Array.isArray(value) ? ['[', ']'] : ['{', '}'];
  return `${open}\n${lines.join('\n')}\n${'  '.repeat(depth)}${close}`;
}

function collectRawIdentifiers(value, identifiers) {
  if (value instanceof Raw) {
    identifiers.add(value.code);
  } else if (isComposite(value)) {
    for (const item of Object.values(value)) {
      collectRawIdentifiers(item, identifiers);
    }
  }
}

function formatImport(names, from) {
  const single = `import { ${names.join(', ')} } from '${from}';`;
  return single.length <= printWidth ? [single] : ['import {', ...names.map((name) => `  ${name},`), `} from '${from}';`];
}

function emitDefaults(pin, files, toneTokens) {
  const groupNames = Object.keys(toneTokens[0].tokens).filter((group) => group !== 'color');
  const shared = {};
  for (const group of groupNames) {
    if (toneTokens.every(({ tokens }) => sameValue(tokens[group], toneTokens[0].tokens[group]))) {
      shared[group] = toneTokens[0].tokens[group];
    }
  }
  const identifiers = new Set();
  collectRawIdentifiers(
    toneTokens.map(({ tokens }) => tokens),
    identifiers,
  );

  const lines = [
    `// Generated by ${generatorPath}. Do not edit; run \`yarn gen:flex-defaults\`.`,
    `// Source: ${pin.repository}@${pin.commit}`,
    ...tones.map((tone) => `//   ${tone.name}: ${files[tone.name].join(', ')}`),
    `// Generic sources: ${mappingPath}`,
    `// Coverage: ${path.relative(packageRoot, outputPaths.ledger).replaceAll('\\', '/')}`,
    '',
    ...formatImport([...identifiers].sort(), '../../tokens/global.generated'),
    "import type { CompleteFlexTokenInput } from '../tokens.types';",
    '',
    `const sharedTokens = ${format(shared, 0, 0, 2)} satisfies Partial<Omit<CompleteFlexTokenInput, 'color'>>;`,
  ];

  for (const { tone, tokens } of toneTokens) {
    const own = { color: tokens.color };
    for (const group of groupNames) {
      if (!Object.hasOwn(shared, group)) {
        own[group] = tokens[group];
      }
    }
    const [open, ...body] = format(own, 0, 0, 2).split('\n');
    body[body.length - 1] += ';';
    lines.push(
      '',
      `/** The x3 ${tone.name}-tone defaults. Omitted interaction states are computed from rest. */`,
      `export const ${tone.exportName}: CompleteFlexTokenInput = ${open}`,
      '  ...sharedTokens,',
      ...body,
    );
  }
  return `${lines.join('\n')}\n`;
}

function createLedger(supportedTypePaths, unsupportedTypePaths) {
  const entries = new Map();
  for (const tokenPath of [...supportedTypePaths, ...unsupportedTypePaths]) {
    entries.set(tokenPath, { path: tokenPath });
  }
  return {
    entries,
    entry(tokenPath) {
      const entry = entries.get(tokenPath);
      if (!entry) {
        throw new Error(`${tokenPath} is not a declared Flex destination.`);
      }
      return entry;
    },
  };
}

const ledgerKeys = ['path', 'source', 'status', 'type', 'state', 'reason', 'adaptation', ...tones.map((tone) => tone.name)];

function emitLedger(pin, files, ledger) {
  const header = {
    generator: generatorPath,
    source: { repository: pin.repository, commit: pin.commit, files },
    mapping: mappingPath,
    notes: [
      'Each tone records the light and dark source values after resolving light-dark() and [data-theme] overrides.',
      'computed: the runtime interaction policy reproduces the source state from rest, so the default omits it. explicit: the default authors the source state.',
      'Computed states equal rest in high contrast; explicit states apply in every contrast.',
      'The x3 semantic sources define no native high-contrast or elevated values; those appearances reuse the light or dark defaults.',
      'native: the emitted value; adaptation: how the source value converts to it.',
      'Theme shadows project to legacy { ambient, key } pairs from the first and last layers; that projection is lossy.',
    ],
  };
  const headerText = JSON.stringify(header, null, 2);
  const destinations = [...ledger.entries.values()].map((entry) => {
    const unknown = Object.keys(entry).filter((key) => !ledgerKeys.includes(key));
    if (unknown.length > 0) {
      throw new Error(`Unordered ledger fields: ${unknown.join(', ')}.`);
    }
    const ordered = Object.fromEntries(ledgerKeys.filter((key) => Object.hasOwn(entry, key)).map((key) => [key, entry[key]]));
    return `    ${JSON.stringify(ordered)}`;
  });
  return `${headerText.slice(0, -2)},\n  "destinations": [\n${destinations.join(',\n')}\n  ]\n}\n`;
}

function generate() {
  const inputs = loadMappingInputs();
  const pin = JSON.parse(readFileSync(pinPath, 'utf8'));
  inputs.pin = new Map(pin.files.map((file) => [file.id, file]));
  const { mappingEntries, violations } = createMappingProjections(inputs.mapping, inputs.supportedTypePaths);
  if (violations.length > 0) {
    throw new Error(`${mappingPath} is invalid; run yarn check:mappings.`);
  }

  const ledger = createLedger(inputs.supportedTypePaths, inputs.unsupportedTypePaths);
  const files = {};
  const toneTokens = tones.map((tone) => {
    files[tone.name] = [tone.semantic, tone.fallback].map((id) => inputs.pin.get(id).upstreamPath);
    return { tone, tokens: resolveTone(tone, inputs, mappingEntries, ledger) };
  });

  return new Map([
    [outputPaths.defaults, emitDefaults(pin, files, toneTokens)],
    [outputPaths.ledger, emitLedger(pin, files, ledger)],
  ]);
}

const check = process.argv.includes('--check');
const stale = [];
for (const [filePath, contents] of generate()) {
  if (existsSync(filePath) && readFileSync(filePath, 'utf8') === contents) {
    continue;
  }
  stale.push(path.relative(packageRoot, filePath).replaceAll('\\', '/'));
  if (!check) {
    writeFileSync(filePath, contents);
  }
}

if (check && stale.length > 0) {
  console.error(`Stale generated Flex defaults: ${stale.join(', ')}. Run yarn gen:flex-defaults.`);
  process.exitCode = 1;
} else if (!check) {
  console.log(stale.length > 0 ? `Updated ${stale.join(', ')}.` : 'Generated Flex defaults are current.');
}
