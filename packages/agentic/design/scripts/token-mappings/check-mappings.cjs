const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');

const nodeRequire = createRequire(__filename);
const { parse: parseTypeScript } = nodeRequire('@babel/parser');
const yamlPackageRoot = path.dirname(nodeRequire.resolve('yaml/package.json'));
const { parse: parseYaml } = nodeRequire(path.join(yamlPackageRoot, 'dist/index.js'));

const packageRoot = path.resolve(__dirname, '../..');
const defaultPaths = {
  defaultTokens: path.join(packageRoot, 'src/tokens/defaultTokens.ts'),
  flexFromTheme: path.join(packageRoot, 'src/tokens/mappings/flex-from-theme.json'),
  flexTokenMap: path.join(packageRoot, 'src/tokens/mappings/flex-token-map.yaml'),
  flexTypes: path.join(packageRoot, 'src/tokens/flex.types.ts'),
};

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function displayValue(value) {
  return value === undefined ? '<missing>' : JSON.stringify(value);
}

function addViolation(violations, rule, tokenPath, expected, actual) {
  violations.push({ rule, path: tokenPath, expected, actual });
}

function getThemeSource(entry, tokenPath, violations) {
  if (!Object.hasOwn(entry, 'furn-theme') || entry['furn-theme'] === null) {
    return undefined;
  }

  const source = entry['furn-theme'];
  if (typeof source !== 'string' || source.length === 0) {
    addViolation(violations, 'schema', tokenPath, 'a non-empty furn-theme path or no furn-theme field', source);
    return undefined;
  }

  return source;
}

function flattenTokenMappings(mapping, violations) {
  const entries = new Map();
  if (!isRecord(mapping.tokens)) {
    addViolation(violations, 'schema', 'tokens', 'an object of token mappings', mapping.tokens);
    return entries;
  }

  for (const [basePath, mappingEntry] of Object.entries(mapping.tokens)) {
    if (!isRecord(mappingEntry)) {
      addViolation(violations, 'schema', basePath, 'a token mapping object', mappingEntry);
      continue;
    }

    if (basePath.startsWith('color.') && Object.hasOwn(mappingEntry, 'rest')) {
      const colorName = basePath.slice('color.'.length);
      for (const state of ['rest', 'hover', 'pressed']) {
        if (!Object.hasOwn(mappingEntry, state)) {
          continue;
        }

        const stateEntry = mappingEntry[state];
        const destination = state === 'rest' ? basePath : `color.${state}.${colorName}`;
        if (!isRecord(stateEntry)) {
          addViolation(violations, 'schema', destination, 'a color-state mapping object', stateEntry);
          continue;
        }

        entries.set(destination, {
          themeSource: getThemeSource(stateEntry, destination, violations),
        });
      }
    } else {
      entries.set(basePath, {
        themeSource: getThemeSource(mappingEntry, basePath, violations),
      });
    }
  }

  return entries;
}

function getDeclaration(statement) {
  return statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
}

function getTypeAliases(program) {
  const aliases = new Map();
  for (const statement of program.body) {
    const declaration = getDeclaration(statement);
    if (declaration?.type === 'TSTypeAliasDeclaration') {
      aliases.set(declaration.id.name, declaration.typeAnnotation);
    }
  }
  return aliases;
}

function getTypeParameters(typeReference) {
  return (typeReference.typeParameters ?? typeReference.typeArguments)?.params ?? [];
}

function getTypeMemberName(member) {
  if (member.computed) {
    throw new Error('Computed properties are not supported in Flex token type declarations.');
  }
  if (member.key.type === 'Identifier' || member.key.type === 'StringLiteral' || member.key.type === 'NumericLiteral') {
    return String(member.key.name ?? member.key.value);
  }
  throw new Error(`Unsupported property name in Flex token type declarations: ${member.key.type}`);
}

function getLiteralNames(typeNode) {
  if (typeNode.type === 'TSUnionType') {
    return typeNode.types.flatMap(getLiteralNames);
  }
  if (typeNode.type === 'TSLiteralType' && typeNode.literal.type === 'StringLiteral') {
    return [typeNode.literal.value];
  }
  throw new Error(`Expected string literal keys in Pick, found ${typeNode.type}.`);
}

function resolveProperties(typeNode, aliases, resolving = new Set()) {
  if (typeNode.type === 'TSParenthesizedType') {
    return resolveProperties(typeNode.typeAnnotation, aliases, resolving);
  }

  if (typeNode.type === 'TSTypeLiteral') {
    return new Map(
      typeNode.members
        .filter((member) => member.type === 'TSPropertySignature')
        .map((member) => [getTypeMemberName(member), member.typeAnnotation?.typeAnnotation]),
    );
  }

  if (typeNode.type === 'TSIntersectionType') {
    const properties = new Map();
    for (const part of typeNode.types) {
      for (const [name, valueType] of resolveProperties(part, aliases, resolving)) {
        properties.set(name, valueType);
      }
    }
    return properties;
  }

  if (typeNode.type === 'TSTypeReference' && typeNode.typeName.type === 'Identifier') {
    const referenceName = typeNode.typeName.name;
    const parameters = getTypeParameters(typeNode);
    if (referenceName === 'Partial' && parameters.length === 1) {
      return resolveProperties(parameters[0], aliases, resolving);
    }
    if (referenceName === 'Pick' && parameters.length === 2) {
      const sourceProperties = resolveProperties(parameters[0], aliases, resolving);
      return new Map(getLiteralNames(parameters[1]).map((name) => [name, sourceProperties.get(name)]));
    }

    const alias = aliases.get(referenceName);
    if (!alias) {
      throw new Error(`Unable to resolve type ${referenceName} while reading Flex token declarations.`);
    }
    if (resolving.has(referenceName)) {
      throw new Error(`Circular Flex token type alias: ${referenceName}.`);
    }

    const nextResolving = new Set(resolving);
    nextResolving.add(referenceName);
    return resolveProperties(alias, aliases, nextResolving);
  }

  throw new Error(`Unsupported Flex token type expression: ${typeNode.type}.`);
}

function readTypePaths(typesPath, typeName) {
  const sourceText = fs.readFileSync(typesPath, 'utf8');
  const program = parseTypeScript(sourceText, {
    plugins: ['typescript'],
    sourceType: 'module',
  }).program;
  const aliases = getTypeAliases(program);
  const declaration = aliases.get(typeName);
  if (!declaration) {
    throw new Error(`Unable to find type ${typeName} in ${typesPath}.`);
  }

  const paths = new Set();
  for (const [groupName, groupType] of resolveProperties(declaration, aliases)) {
    for (const [tokenName, tokenType] of resolveProperties(groupType, aliases)) {
      if (groupName === 'color' && (tokenName === 'hover' || tokenName === 'pressed')) {
        for (const stateTokenName of resolveProperties(tokenType, aliases).keys()) {
          paths.add(`${groupName}.${tokenName}.${stateTokenName}`);
        }
      } else {
        paths.add(`${groupName}.${tokenName}`);
      }
    }
  }

  return paths;
}

function unwrapExpression(expression) {
  let current = expression;
  while (
    current.type === 'TSAsExpression' ||
    current.type === 'ParenthesizedExpression' ||
    current.type === 'TSSatisfiesExpression' ||
    current.type === 'TSTypeAssertion'
  ) {
    current = current.expression;
  }
  return current;
}

function getPropertyName(property) {
  if (property.computed) {
    throw new Error('Computed properties are not supported in nonFluentFlexTokens.');
  }
  if (property.key.type === 'Identifier' || property.key.type === 'StringLiteral' || property.key.type === 'NumericLiteral') {
    return String(property.key.name ?? property.key.value);
  }
  throw new Error(`Unsupported property in nonFluentFlexTokens: ${property.key.type}`);
}

function findVariableInitializer(program, variableName) {
  for (const statement of program.body) {
    const declaration = getDeclaration(statement);
    if (declaration?.type !== 'VariableDeclaration') {
      continue;
    }

    for (const variable of declaration.declarations) {
      if (variable.id.type === 'Identifier' && variable.id.name === variableName && variable.init) {
        return variable.init;
      }
    }
  }

  throw new Error(`Unable to find ${variableName}.`);
}

function readNonFluentValues(defaultTokensPath, supportedTypePaths) {
  const sourceText = fs.readFileSync(defaultTokensPath, 'utf8');
  const program = parseTypeScript(sourceText, {
    plugins: ['typescript'],
    sourceType: 'module',
  }).program;
  const root = unwrapExpression(findVariableInitializer(program, 'nonFluentFlexTokens'));
  const supportedPaths = [...supportedTypePaths];
  const values = new Map();

  function collect(expression, prefix) {
    const value = unwrapExpression(expression);
    if (prefix && supportedTypePaths.has(prefix)) {
      values.set(prefix, sourceText.slice(value.start, value.end));
      return;
    }

    const hasKnownDescendants = supportedPaths.some((candidate) => candidate.startsWith(`${prefix}.`));
    if (value.type !== 'ObjectExpression' || (prefix && !hasKnownDescendants)) {
      values.set(prefix, sourceText.slice(value.start, value.end));
      return;
    }

    for (const property of value.properties) {
      if (property.type !== 'ObjectProperty') {
        throw new Error(`Unsupported property in nonFluentFlexTokens: ${sourceText.slice(property.start, property.end)}`);
      }

      const name = getPropertyName(property);
      collect(property.value, prefix ? `${prefix}.${name}` : name);
    }
  }

  if (root.type !== 'ObjectExpression') {
    throw new Error('nonFluentFlexTokens must be initialized with an object literal.');
  }
  collect(root, '');
  values.delete('');
  return values;
}

function loadMappingInputs(paths = defaultPaths) {
  const supportedTypePaths = readTypePaths(paths.flexTypes, 'FlexTokens');
  return {
    mapping: parseYaml(fs.readFileSync(paths.flexTokenMap, 'utf8')),
    nonFluentValues: readNonFluentValues(paths.defaultTokens, supportedTypePaths),
    supportedTypePaths,
    themeProjection: JSON.parse(fs.readFileSync(paths.flexFromTheme, 'utf8')),
    unsupportedTypePaths: readTypePaths(paths.flexTypes, 'UnsupportedFlexTokens'),
  };
}

function getInteractionRestPath(tokenPath) {
  const match = /^color\.(?:hover|pressed)\.(.+)$/.exec(tokenPath);
  return match ? `color.${match[1]}` : undefined;
}

function validateMappingInputs(inputs) {
  const violations = [];
  const { mapping, nonFluentValues, supportedTypePaths, themeProjection, unsupportedTypePaths } = inputs;

  if (!isRecord(mapping)) {
    return [{ rule: 'schema', path: '<root>', expected: 'a mapping object', actual: mapping }];
  }
  if (mapping.schemaVersion !== 1) {
    addViolation(violations, 'schema', 'schemaVersion', 1, mapping.schemaVersion);
  }
  if (!isRecord(themeProjection)) {
    addViolation(violations, 'theme-projection', '<root>', 'an object of FlexTokens paths to Theme paths', themeProjection);
    return violations;
  }

  const mappingEntries = flattenTokenMappings(mapping, violations);
  const supportedEntries = new Map();

  for (const [tokenPath, entry] of mappingEntries) {
    if (supportedTypePaths.has(tokenPath)) {
      supportedEntries.set(tokenPath, entry);
    } else if (unsupportedTypePaths.has(tokenPath)) {
      if (entry.themeSource !== undefined) {
        addViolation(violations, 'theme-projection', tokenPath, '<absent because the destination is unsupported>', entry.themeSource);
      }
    } else {
      addViolation(violations, 'flex-token-type', tokenPath, 'a path declared by FlexTokens or UnsupportedFlexTokens', '<undeclared>');
    }
  }

  for (const [tokenPath, entry] of supportedEntries) {
    const projectedSource = themeProjection[tokenPath];
    if (entry.themeSource === undefined) {
      if (Object.hasOwn(themeProjection, tokenPath)) {
        addViolation(violations, 'theme-projection', tokenPath, '<absent>', projectedSource);
      }
    } else if (projectedSource !== entry.themeSource) {
      addViolation(violations, 'theme-projection', tokenPath, entry.themeSource, projectedSource);
    }
  }

  for (const [tokenPath, source] of Object.entries(themeProjection)) {
    if (!supportedEntries.has(tokenPath)) {
      addViolation(violations, 'theme-projection', tokenPath, 'a supported YAML destination with the same furn-theme path', source);
    }
  }

  for (const [tokenPath, entry] of supportedEntries) {
    if (entry.themeSource !== undefined) {
      continue;
    }

    const restPath = getInteractionRestPath(tokenPath);
    const restIsThemeBacked = restPath !== undefined && Object.hasOwn(themeProjection, restPath);
    if (!restIsThemeBacked && !nonFluentValues.has(tokenPath)) {
      addViolation(violations, 'non-fluent-coverage', tokenPath, 'a value in nonFluentFlexTokens', '<missing>');
    }
  }

  for (const [tokenPath, value] of nonFluentValues) {
    const mappingEntry = supportedEntries.get(tokenPath);
    if (!mappingEntry) {
      addViolation(violations, 'non-fluent-coverage', tokenPath, 'a supported destination in flex-token-map.yaml', value);
      continue;
    }
    if (mappingEntry.themeSource !== undefined) {
      addViolation(violations, 'non-fluent-coverage', tokenPath, '<absent because the destination is Theme-backed>', value);
    }

    const restPath = getInteractionRestPath(tokenPath);
    if (restPath !== undefined && Object.hasOwn(themeProjection, restPath)) {
      addViolation(
        violations,
        'interaction-fallback',
        tokenPath,
        `${restPath} to be absent from flex-from-theme.json`,
        themeProjection[restPath],
      );
    }
  }

  return violations.sort(
    (left, right) =>
      left.rule.localeCompare(right.rule) || left.path.localeCompare(right.path) || String(left.actual).localeCompare(String(right.actual)),
  );
}

function formatMappingViolations(violations) {
  const details = violations.map(
    ({ rule, path: tokenPath, expected, actual }) =>
      `- [${rule}] ${tokenPath}: expected ${displayValue(expected)}; actual ${displayValue(actual)}`,
  );
  return `Flex token mapping consistency check failed with ${violations.length} violation(s):\n${details.join('\n')}`;
}

function checkMappings(paths) {
  return validateMappingInputs(loadMappingInputs(paths));
}

function assertMappingsConsistent(paths) {
  const violations = checkMappings(paths);
  if (violations.length > 0) {
    throw new Error(formatMappingViolations(violations));
  }
}

if (require.main === module) {
  try {
    assertMappingsConsistent();
    console.log('Flex token mappings are consistent.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = {
  assertMappingsConsistent,
  checkMappings,
  formatMappingViolations,
  loadMappingInputs,
  validateMappingInputs,
};
