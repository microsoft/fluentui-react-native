const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');

const nodeRequire = createRequire(__filename);
const { JSON_DELETION, createJsonObjectDelta, serializeJson, sortJsonValue } = require('@fluentui-react-native/scripts');
const { createMappingProjections, loadMappingInputs } = require('../token-mappings/check-mappings.cjs');

const packageRoot = path.resolve(__dirname, '../..');
const repositoryRoot = path.resolve(packageRoot, '../../..');
const sourceMatrix = require('./source-matrix.json');
const sourceAdapters = require('./source-adapters.json');
const appearanceNames = ['light', 'dark', 'darkElevated', 'lightHighContrast', 'darkHighContrast'];
const platforms = ['win32', 'windows', 'macos', 'android', 'ios'];
const appearanceParents = {
  dark: 'light',
  darkElevated: 'dark',
  lightHighContrast: 'light',
  darkHighContrast: 'dark',
};
const rawExpression = Symbol('rawExpression');
const unresolvedPlatformSources = new Set();

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function serialize(value) {
  return serializeJson(value, 2);
}

function serializeWithPooledColors(value, serializedBody = serialize(value)) {
  const counts = new Map();
  function countColors(entry) {
    if (typeof entry === 'string' && /^(?:#[\da-f]{3,8}|rgba?\(.+\))$/i.test(entry)) {
      counts.set(entry, (counts.get(entry) ?? 0) + 1);
    } else if (Array.isArray(entry)) {
      entry.forEach(countColors);
    } else if (isRecord(entry)) {
      Object.values(entry).forEach(countColors);
    }
  }
  countColors(value);

  const pooledColors = [...counts]
    .filter(([color, count]) => count >= 3 && (count - 1) * (JSON.stringify(color).length - 1) > 10)
    .sort(([left], [right]) => left.localeCompare(right));
  let body = serializedBody;
  for (const [index, [color]] of pooledColors.entries()) {
    body = body.replaceAll(JSON.stringify(color), `color${index}`);
  }
  const declarations = pooledColors.map(([color], index) => `const color${index} = ${JSON.stringify(color)};`).join('\n');
  return { body, declarations };
}

function renderTypeScriptValue(value, indent = 0) {
  if (isRecord(value) && rawExpression in value) {
    return value[rawExpression];
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => renderTypeScriptValue(entry, indent)).join(', ')}]`;
  }
  if (!isRecord(value)) {
    return JSON.stringify(value);
  }
  const padding = ' '.repeat(indent);
  const childPadding = ' '.repeat(indent + 2);
  const entries = Object.entries(value).map(
    ([key, entry]) => `${childPadding}${JSON.stringify(key)}: ${renderTypeScriptValue(entry, indent + 2)}`,
  );
  return `{\n${entries.join(',\n')}\n${padding}}`;
}

function serializeLazyDefinitions(definitions, poolColors) {
  const lazyDefinitions = Object.fromEntries(
    Object.entries(definitions).map(([name, definition]) => [
      name,
      'value' in definition
        ? { value: { [rawExpression]: `() => (${serialize(definition.value)})` } }
        : {
            parent: definition.parent,
            delta: { [rawExpression]: `() => (${serialize(definition.delta)})` },
            ...(definition.deletedPaths ? { deletedPaths: definition.deletedPaths } : {}),
          },
    ]),
  );
  const body = renderTypeScriptValue(lazyDefinitions);
  return poolColors ? serializeWithPooledColors(definitions, body) : { body, declarations: '' };
}

function extractDeletedPaths(delta, prefix = '', deletedPaths = []) {
  const result = {};
  for (const [key, value] of Object.entries(delta)) {
    const valuePath = prefix ? `${prefix}.${key}` : key;
    if (value === JSON_DELETION) {
      deletedPaths.push(valuePath);
    } else {
      result[key] = isRecord(value) ? extractDeletedPaths(value, valuePath, deletedPaths) : value;
    }
  }
  return result;
}

function createDefinitions(values) {
  const definitions = {
    light: { value: sortJsonValue(values.light) },
  };
  for (const name of appearanceNames.slice(1)) {
    const parentName = appearanceParents[name];
    const deletedPaths = [];
    const delta = extractDeletedPaths(createJsonObjectDelta(values[parentName], values[name]), '', deletedPaths);
    const deltaDefinition = {
      parent: parentName,
      delta,
      ...(deletedPaths.length > 0 ? { deletedPaths } : {}),
    };
    definitions[name] =
      serialize(deltaDefinition).length < serialize(values[name]).length ? deltaDefinition : { value: sortJsonValue(values[name]) };
  }
  return definitions;
}

function writeFileIfChanged(filePath, contents) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === contents) {
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function loadJson(specifier, sourceLocks) {
  const filePath = nodeRequire.resolve(specifier);
  const packageName = specifier.split('/').slice(0, 2).join('/');
  const packageVersion = nodeRequire(`${packageName}/package.json`).version;
  const contents = fs.readFileSync(filePath);
  sourceLocks.set(specifier, {
    package: packageName,
    version: packageVersion,
    path: specifier,
    sha256: crypto.createHash('sha256').update(contents).digest('hex'),
  });
  return JSON.parse(contents.toString('utf8'));
}

function normalizeGlobals(tokens) {
  const normalized = structuredClone(tokens);
  const family = normalized.font.family;
  family.base ??= family.default;
  family.monospace ??= family.base;
  family.numeric ??= family.base;
  return normalized;
}

function loadSource(source, sourceLocks) {
  const prefix = `${source.package}/${source.appearance}`;
  return {
    aliases: loadJson(`${prefix}/tokens-aliases.json`, sourceLocks),
    globals: normalizeGlobals(loadJson(`${prefix}/tokens-global.json`, sourceLocks)),
    shadows: loadJson(`${prefix}/tokens-shadow.json`, sourceLocks),
  };
}

function sourceForAppearance(platform, appearanceName) {
  const matrix = sourceMatrix[platform];
  if (matrix[appearanceName]) {
    return matrix[appearanceName];
  }
  if (appearanceName === 'darkElevated') {
    return matrix.dark;
  }
  if (appearanceName === 'lightHighContrast') {
    return matrix.lightHighContrast ?? matrix.highContrast ?? matrix.light;
  }
  if (appearanceName === 'darkHighContrast') {
    return matrix.darkHighContrast ?? matrix.highContrast ?? matrix.dark;
  }
  return matrix[appearanceName];
}

function getValueAtPath(value, sourcePath) {
  let current = value;
  for (const segment of sourcePath.split('.')) {
    if (!isRecord(current) || !Object.hasOwn(current, segment)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function replaceSourcePrefix(source, from, to) {
  if (source === from) {
    return to;
  }
  if (!source.startsWith(`${from}.`)) {
    return source;
  }
  return to.startsWith('global.') || to.startsWith('literal.') ? to : `${to}${source.slice(from.length)}`;
}

function adaptedSource(platform, source) {
  let adapted = source;
  for (const [from, to] of Object.entries(sourceAdapters[platform] ?? {})) {
    adapted = replaceSourcePrefix(adapted, from, to);
    if (adapted !== source) {
      break;
    }
  }
  return adapted;
}

function readFluentSource(sourceSet, source) {
  const [family, ...segments] = source.split('.');
  if (family === 'literal' && segments.join('.') === 'transparent') {
    return '#00000000';
  }
  if (family === 'shadow') {
    const layers = getValueAtPath(sourceSet.shadows, segments.join('.'));
    return Array.isArray(layers) && layers.length >= 2 ? { ambient: layers[0], key: layers[1] } : undefined;
  }

  const root = family === 'alias' ? sourceSet.aliases : family === 'global' ? sourceSet.globals : undefined;
  if (!root) {
    return undefined;
  }
  let value = getValueAtPath(root, segments.join('.'));
  if (value === undefined && family === 'alias' && ['hover', 'pressed'].includes(segments.at(-1))) {
    value = getValueAtPath(root, [...segments.slice(0, -1), 'rest'].join('.'));
  }
  return value;
}

function setValueAtPath(destination, destinationPath, value) {
  const segments = destinationPath.split('.');
  let current = destination;
  for (const segment of segments.slice(0, -1)) {
    current[segment] ??= {};
    current = current[segment];
  }
  current[segments.at(-1)] = sortJsonValue(value);
}

function buildFlexTokens(platform, sourceSet, fallbackSet, canonicalSet, mappingEntries, supportedTypePaths) {
  const result = {};
  const resolved = new Map();

  function resolveToken(tokenPath) {
    if (resolved.has(tokenPath)) {
      return resolved.get(tokenPath);
    }

    const entry = mappingEntries.get(tokenPath);
    let value;
    if (entry?.fluentSource) {
      const source = adaptedSource(platform, entry.fluentSource);
      value = readFluentSource(sourceSet, source);
      if (value === undefined && fallbackSet) {
        value = readFluentSource(fallbackSet, source);
      }
      if (value === undefined && source !== entry.fluentSource) {
        value = readFluentSource(sourceSet, entry.fluentSource) ?? (fallbackSet && readFluentSource(fallbackSet, entry.fluentSource));
      }
      if (value === undefined && entry.fluentSource.startsWith('global.')) {
        value = readFluentSource(canonicalSet, entry.fluentSource);
      }
      if (value === undefined) {
        value = readFluentSource(canonicalSet, entry.fluentSource);
        if (value !== undefined) {
          unresolvedPlatformSources.add(`${platform}: ${entry.fluentSource}`);
        }
      }
    } else {
      const interaction = /^color\.(?:hover|pressed)\.(.+)$/.exec(tokenPath);
      if (interaction) {
        value = resolveToken(`color.${interaction[1]}`);
      } else if (tokenPath === 'fontFamily.contentEditorial') {
        value = sourceSet.globals.font.family.base;
      }
    }

    if (value === undefined) {
      throw new Error(`Unable to resolve ${tokenPath} for ${platform} from ${entry?.fluentSource ?? 'an explicit fallback'}.`);
    }
    resolved.set(tokenPath, value);
    return value;
  }

  for (const tokenPath of [...supportedTypePaths].sort()) {
    setValueAtPath(result, tokenPath, resolveToken(tokenPath));
  }
  return result;
}

function compactInteractionValues(tokens) {
  const result = structuredClone(tokens);
  for (const state of ['hover', 'pressed']) {
    for (const [name, value] of Object.entries(result.color[state])) {
      if (value === result.color[name]) {
        delete result.color[state][name];
      }
    }
  }
  return result;
}

function expressionAccess(root, sourcePath) {
  return [...(root ? [root] : []), ...sourcePath.split('.')].join('?.');
}

function propertyName(key) {
  return /^[$A-Z_a-z][$\w]*$/.test(key) ? key : JSON.stringify(key);
}

function renderExpressionEntries(value, indent = 0) {
  const childPadding = ' '.repeat(indent + 2);
  return Object.keys(value)
    .sort()
    .map((key) => {
      const child = value[key];
      return `${childPadding}${propertyName(key)}: ${isRecord(child) ? renderExpressionObject(child, indent + 2) : child},`;
    })
    .join('\n');
}

function renderExpressionObject(value, indent = 0) {
  return `{\n${renderExpressionEntries(value, indent)}\n${' '.repeat(indent)}}`;
}

function buildExpressionTree(entries) {
  const result = {};
  for (const [destinationPath, expression] of entries) {
    setValueAtPath(result, destinationPath, expression);
  }
  return result;
}

function generateProjectionFiles(mapping) {
  const forwardEntries = Object.entries(mapping.themeProjection).map(([destination, source]) => {
    const componentPrefix = 'components.Button.tokens.';
    return [
      destination,
      source.startsWith(componentPrefix)
        ? `buttonTokens?.${source.slice(componentPrefix.length).split('.').join('?.')}`
        : expressionAccess('', source),
    ];
  });
  const reverseEntries = Object.entries(mapping.reverseProjection).map(([destination, descriptor]) => {
    const source = expressionAccess('', descriptor.source);
    const fallback = descriptor.fallback ? ` ?? ${expressionAccess('', descriptor.fallback)}` : '';
    const expression = descriptor.transform === 'numberToPx' ? `numberToPx(${source}${fallback})` : `${source}${fallback}`;
    return [destination, expression];
  });
  const forwardTree = buildExpressionTree(forwardEntries);
  const optionalComponentProjection = forwardTree.borderRadius;
  delete forwardTree.borderRadius;
  const header = `/**\n * WARNING: This file is auto-generated. Do not edit it manually.\n */\n`;
  const forwardRoots = [
    ...new Set(
      Object.values(mapping.themeProjection)
        .map((source) => source.split('.')[0])
        .filter((root) => root !== 'components'),
    ),
  ].sort();
  const reverseRoots = [
    ...new Set(
      Object.values(mapping.reverseProjection).flatMap((descriptor) =>
        [descriptor.source, descriptor.fallback].filter(Boolean).map((source) => source.split('.')[0]),
      ),
    ),
  ].sort();

  writeFileIfChanged(
    path.join(packageRoot, 'src/tokens/mappings/flexFromTheme.generated.ts'),
    `${header}\nimport type { Theme } from '../../theming/types/Theme.types';\nimport { omitUndefinedProperties } from './omitUndefinedProperties';\n\nexport function projectThemeToFlex(theme: Theme) {\n  const { ${forwardRoots.join(', ')} } = theme;\n  const buttonTokens = (theme.components?.Button as { tokens?: { borderRadius?: number } } | undefined)?.tokens;\n  return omitUndefinedProperties({\n    ...(buttonTokens?.borderRadius === undefined ? {} : { borderRadius: ${renderExpressionObject(
      optionalComponentProjection,
      4,
    )} }),\n${renderExpressionEntries(forwardTree, 2)}\n  });\n}\n`,
  );
  const usesNumberToPx = reverseEntries.some(([, expression]) => expression.startsWith('numberToPx('));
  writeFileIfChanged(
    path.join(packageRoot, 'src/tokens/mappings/themeFromFlex.generated.ts'),
    `${header}\nimport type { FlexTokens } from '../flex.types';\nimport type { PartialTheme } from '../../theming/types/Theme.types';\nimport { omitUndefinedProperties } from './omitUndefinedProperties';\n${
      usesNumberToPx
        ? "\nfunction numberToPx(value: unknown): unknown {\n  return typeof value === 'number' ? `${value}px` : value;\n}\n"
        : ''
    }\nexport function projectFlexToTheme(tokens: FlexTokens): PartialTheme {\n  const { ${reverseRoots.join(', ')} } = tokens;\n  return omitUndefinedProperties(${renderExpressionObject(
      buildExpressionTree(reverseEntries),
      2,
    )}) as PartialTheme;\n}\n`,
  );
}

function generateDefinitionFile(filePath, exportName, definitions, valueType, typeImport, poolColors = false) {
  const valueTypeImport = valueType === 'GeneratedFlexTokenSource' ? './generatedFlexTokenSource.types' : '../generatedTokenSet.types';
  const serialized = serializeLazyDefinitions(definitions, poolColors);
  const contents = `/**\n * WARNING: This file is auto-generated. Do not edit it manually.\n */\n\nimport type { GeneratedAppearanceName } from '${typeImport}/appearanceNames';\nimport type { GeneratedValueDefinitions } from '${typeImport}/types';\nimport type { ${valueType} } from '${valueTypeImport}';\n${
    serialized.declarations ? `\n${serialized.declarations}\n` : ''
  }\nexport const ${exportName} = ${serialized.body} as const satisfies GeneratedValueDefinitions<${valueType}, GeneratedAppearanceName>;\n`;
  writeFileIfChanged(filePath, contents);
}

function generateGlobalFile(filePath, globals, metadata) {
  writeFileIfChanged(
    filePath,
    `/**\n * WARNING: This file is auto-generated. Do not edit it manually.\n * Source: ${metadata.package}/${metadata.appearance}/tokens-global.json\n */\n\nconst globalTokens = ${serialize(
      globals,
    )};\n\nexport default globalTokens;\n`,
  );
}

function generateLegacyGlobalSubsetFile(filePath, globals, metadata) {
  const paths = ['font.size100', 'font.size200', 'font.size300', 'font.size400', 'font.size500', 'font.size700', 'font.size900'];
  if (isRecord(globals.color.brand)) {
    paths.push(
      'color.brand.primary',
      ...['shade10', 'shade20', 'shade30', 'shade40', 'shade50', 'shade60'].map((name) => `color.brand.${name}`),
      ...['tint10', 'tint20', 'tint30', 'tint40', 'tint50', 'tint60'].map((name) => `color.brand.${name}`),
    );
  } else {
    paths.push(
      ...[
        'brand30',
        'brand40',
        'brand50',
        'brand60',
        'brand70',
        'brand80',
        'brand90',
        'brand100',
        'brand110',
        'brand120',
        'brand140',
        'brand150',
        'brand160',
      ].map((name) => `color.${name}`),
    );
  }

  const subset = {};
  for (const tokenPath of paths) {
    const value = getValueAtPath(globals, tokenPath);
    if (value === undefined) {
      throw new Error(`Unable to generate legacy global token subset path ${tokenPath}.`);
    }
    setValueAtPath(subset, tokenPath, value);
  }
  writeFileIfChanged(
    filePath,
    `/**\n * WARNING: This file is auto-generated. Do not edit it manually.\n * Source: ${metadata.package}/${metadata.appearance}/tokens-global.json\n */\n\nexport const legacyGlobalTokens = ${serialize(subset)} as const;\n`,
  );
}

function generatePlatform(platform, mapping, sourceLocks, canonicalSet) {
  const sourceSets = Object.fromEntries(
    appearanceNames.map((name) => {
      const source = sourceForAppearance(platform, name);
      return [name, { metadata: source, tokens: loadSource(source, sourceLocks) }];
    }),
  );
  const standardFallbacks = {
    light: sourceSets.light.tokens,
    dark: sourceSets.light.tokens,
    darkElevated: sourceSets.dark.tokens,
    lightHighContrast: sourceSets.light.tokens,
    darkHighContrast: sourceSets.dark.tokens,
  };
  const flexValues = {};
  const rawValues = {};

  for (const name of appearanceNames) {
    const source =
      (platform === 'win32' || platform === 'windows') && name.endsWith('HighContrast') ? standardFallbacks[name] : sourceSets[name].tokens;
    flexValues[name] = compactInteractionValues(
      buildFlexTokens(platform, source, standardFallbacks[name], canonicalSet, mapping.mappingEntries, mapping.supportedTypePaths),
    );
    rawValues[name] = {
      aliases: sourceSets[name].tokens.aliases,
      shadows: sourceSets[name].tokens.shadows,
    };
  }

  const flexSuffix = platform === 'win32' ? '' : `.${platform}`;
  const legacySuffix = platform === 'windows' ? '' : `.${platform}`;
  generateDefinitionFile(
    path.join(packageRoot, `src/tokens/generated/defaultTokens${flexSuffix}.ts`),
    'generatedDefaultTokenDefinitions',
    createDefinitions(flexValues),
    'GeneratedFlexTokenSource',
    '.',
    true,
  );
  generateDefinitionFile(
    path.join(packageRoot, `src/tokens/legacy/generated/tokenSets${legacySuffix}.ts`),
    'generatedLegacyTokenDefinitions',
    createDefinitions(rawValues),
    'GeneratedLegacyTokenSet',
    '../../generated',
  );
  if (platform === 'windows') {
    const compatibilityValues = {
      ...rawValues,
      lightHighContrast: rawValues.light,
      darkHighContrast: rawValues.dark,
    };
    generateDefinitionFile(
      path.join(packageRoot, 'src/tokens/legacy/generated/tokenSets.windowsSource.ts'),
      'generatedLegacyTokenDefinitions',
      createDefinitions(compatibilityValues),
      'GeneratedLegacyTokenSet',
      '../../generated',
    );
  }
  if (platform === 'win32') {
    writeFileIfChanged(
      path.join(packageRoot, 'src/tokens/legacy/generated/highContrastTokenSet.ts'),
      `/**\n * WARNING: This file is auto-generated. Do not edit it manually.\n */\n\nimport type { GeneratedLegacyTokenSet } from '../generatedTokenSet.types';\n\nexport const generatedHighContrastTokenSet = ${serialize(
        {
          aliases: sourceSets.lightHighContrast.tokens.aliases,
          shadows: sourceSets.lightHighContrast.tokens.shadows,
        },
      )} as const satisfies GeneratedLegacyTokenSet;\n`,
    );
  }
  if (platform !== 'macos') {
    generateGlobalFile(
      path.join(packageRoot, `src/tokens/legacy/generated/tokens-global${legacySuffix}.ts`),
      sourceSets.light.tokens.globals,
      sourceSets.light.metadata,
    );
    generateLegacyGlobalSubsetFile(
      path.join(packageRoot, `src/tokens/legacy/generated/legacyGlobals${legacySuffix}.ts`),
      sourceSets.light.tokens.globals,
      sourceSets.light.metadata,
    );
  }
}

function main() {
  unresolvedPlatformSources.clear();
  const inputs = loadMappingInputs();
  const projections = createMappingProjections(inputs.mapping, inputs.supportedTypePaths);
  if (projections.violations.length > 0) {
    throw new Error(`Cannot generate token data with ${projections.violations.length} mapping violation(s).`);
  }
  const mapping = {
    ...projections,
    supportedTypePaths: inputs.supportedTypePaths,
  };
  const sourceLocks = new Map();
  const canonicalSet = loadSource(sourceMatrix.win32.light, sourceLocks);

  for (const platform of platforms) {
    generatePlatform(platform, mapping, sourceLocks, canonicalSet);
  }
  if (unresolvedPlatformSources.size > 0) {
    throw new Error(
      `Platform source adapters are required for:\n${[...unresolvedPlatformSources]
        .sort()
        .map((source) => `- ${source}`)
        .join('\n')}`,
    );
  }
  const interactionTokenNames = [...inputs.supportedTypePaths]
    .flatMap((tokenPath) => /^color\.hover\.(.+)$/.exec(tokenPath)?.[1] ?? [])
    .sort();
  writeFileIfChanged(
    path.join(packageRoot, 'src/tokens/generated/interactionTokenNames.ts'),
    `/**\n * WARNING: This file is auto-generated. Do not edit it manually.\n */\n\nexport const interactionTokenNames = ${serialize(
      interactionTokenNames,
    )} as const;\n`,
  );
  generateProjectionFiles(projections);
  writeFileIfChanged(
    path.join(__dirname, 'source-lock.json'),
    `${serialize({
      generatedBy: 'scripts/token-sources/generate-tokens.cjs',
      inputs: [...sourceLocks.values()].sort((left, right) => left.path.localeCompare(right.path)),
    })}\n`,
  );

  const rootRequire = createRequire(path.join(repositoryRoot, 'package.json'));
  const formatter = path.join(path.dirname(rootRequire.resolve('oxfmt/package.json')), 'bin/oxfmt');
  const formatResult = spawnSync(
    process.execPath,
    [
      formatter,
      path.join(packageRoot, 'src/tokens/generated'),
      path.join(packageRoot, 'src/tokens/legacy/generated'),
      path.join(packageRoot, 'src/tokens/mappings/flexFromTheme.generated.ts'),
      path.join(packageRoot, 'src/tokens/mappings/themeFromFlex.generated.ts'),
    ],
    { cwd: repositoryRoot, stdio: 'inherit' },
  );
  if (formatResult.status !== 0) {
    throw new Error(`Unable to format generated token files (exit code ${formatResult.status ?? 'unknown'}).`);
  }
}

module.exports = { main };
