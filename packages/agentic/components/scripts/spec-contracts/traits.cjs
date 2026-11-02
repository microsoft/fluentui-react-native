const babel = require('@babel/core');

const traitsLink = './spec/traits.ts';
const traitsSchemaVersion = '1';
const traitsFacets = new Set(['typography', 'channels', 'hover', 'focusVisual', 'geometry']);

function camelCase(component) {
  return component.replace(/-([a-z0-9])/g, (_match, letter) => letter.toUpperCase());
}

function traitsConstantName(component) {
  return `${camelCase(component)}Traits`;
}

function fail(label, node, message) {
  const line = node?.loc?.start?.line;
  throw new Error(`${label}${line ? `:${line}` : ''} ${message}`);
}

function propertyName(property, label) {
  if (property.computed) {
    fail(label, property, 'must not use computed keys.');
  }
  if (property.key.type === 'Identifier') {
    return property.key.name;
  }
  if (property.key.type === 'StringLiteral') {
    return property.key.value;
  }
  return fail(label, property, 'must use identifier or string keys.');
}

/**
 * Converts the literal value of a traits constant into plain data. Only nested objects with string, number, and
 * boolean leaves are accepted, so the value never depends on code that runs.
 */
function readLiteral(node, label) {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'ObjectExpression': {
      const value = {};
      for (const property of node.properties) {
        if (property.type !== 'ObjectProperty') {
          fail(label, property, 'must contain only plain properties (no spreads, methods, or accessors).');
        }
        if (property.shorthand) {
          fail(label, property, 'must not use shorthand properties.');
        }
        const name = propertyName(property, label);
        if (Object.hasOwn(value, name)) {
          fail(label, property, `repeats the key ${name}.`);
        }
        value[name] = readLiteral(property.value, label);
      }
      return value;
    }
    default:
      return fail(label, node, `must contain only string, number, boolean, or object literals (found ${node.type}).`);
  }
}

function isAsConst(node) {
  return (
    node.type === 'TSAsExpression' &&
    node.typeAnnotation.type === 'TSTypeReference' &&
    node.typeAnnotation.typeName.type === 'Identifier' &&
    node.typeAnnotation.typeName.name === 'const'
  );
}

function isTraitsReference(node) {
  return node.type === 'TSTypeReference' && node.typeName.type === 'Identifier' && node.typeName.name === 'Traits';
}

function validateTraitsRules(traits, label) {
  for (const facet of Object.keys(traits)) {
    if (!traitsFacets.has(facet)) {
      throw new Error(`${label} declares unknown facet ${facet}.`);
    }
  }
  const channelModes = Object.values(traits.channels || {}).flatMap((part) => Object.values(part));
  if (channelModes.includes('interactive') && !Object.hasOwn(traits, 'hover')) {
    throw new Error(`${label} must declare hover because a channel is interactive.`);
  }
}

/**
 * Validates the source of a component's `spec/traits.ts` without importing or evaluating it, and returns the
 * declared traits as data. The file may contain type-only imports and one exported literal constant named
 * `<component>Traits` written as `{ ... } as const satisfies Traits<...>`.
 */
function readTraitsSource(source, component, label = `${component}/spec/traits.ts`) {
  const file = babel.parseSync(source.replace(/\r\n/g, '\n'), {
    babelrc: false,
    configFile: false,
    filename: 'traits.ts',
    sourceType: 'module',
    parserOpts: { plugins: ['typescript'] },
  });
  const expectedName = traitsConstantName(component);
  let traits;
  for (const statement of file.program.body) {
    if (statement.type === 'ImportDeclaration') {
      if (statement.importKind !== 'type') {
        fail(label, statement, 'may only use `import type` declarations.');
      }
      continue;
    }
    if (statement.type !== 'ExportNamedDeclaration' || statement.declaration?.type !== 'VariableDeclaration') {
      fail(label, statement, `may only contain type-only imports and the exported ${expectedName} constant.`);
    }
    if (traits !== undefined) {
      fail(label, statement, `must export exactly one ${expectedName} constant.`);
    }
    const declaration = statement.declaration;
    if (declaration.kind !== 'const' || declaration.declarations.length !== 1) {
      fail(label, declaration, `must declare ${expectedName} as a single const.`);
    }
    const [declarator] = declaration.declarations;
    if (declarator.id.type !== 'Identifier' || declarator.id.name !== expectedName || declarator.id.typeAnnotation) {
      fail(label, declarator, `must export an unannotated const named ${expectedName}.`);
    }
    const init = declarator.init;
    if (!init || init.type !== 'TSSatisfiesExpression' || !isTraitsReference(init.typeAnnotation) || !isAsConst(init.expression)) {
      fail(label, declarator, `must write ${expectedName} as \`{ ... } as const satisfies Traits<...>\`.`);
    }
    if (init.expression.expression.type !== 'ObjectExpression') {
      fail(label, init, `${expectedName} must be an object literal.`);
    }
    traits = readLiteral(init.expression.expression, label);
  }
  if (traits === undefined) {
    throw new Error(`${label} must export ${expectedName}.`);
  }
  validateTraitsRules(traits, label);
  return traits;
}

/**
 * Validates the optional `traits` and `traits-schema` SPEC.md front-matter fields against the component's
 * `spec/traits.ts` file. `traitsSource` is the file text, or undefined when the file does not exist.
 */
function validateTraitsLink(frontMatter, traitsSource, component) {
  const label = `${component}/SPEC.md`;
  if (Object.hasOwn(frontMatter, 'traits-schema')) {
    if (!Object.hasOwn(frontMatter, 'traits')) {
      throw new Error(`${label} declares traits-schema without traits.`);
    }
    if (frontMatter['traits-schema'] !== traitsSchemaVersion) {
      throw new Error(`${label} must use traits-schema: ${traitsSchemaVersion}.`);
    }
  }
  if (!Object.hasOwn(frontMatter, 'traits')) {
    if (traitsSource !== undefined) {
      throw new Error(`${label} must reference ${traitsLink} with traits.`);
    }
    return undefined;
  }
  if (frontMatter.traits !== traitsLink) {
    throw new Error(`${label} must reference ${traitsLink}.`);
  }
  if (traitsSource === undefined) {
    throw new Error(`${component} is missing spec/traits.ts.`);
  }
  return readTraitsSource(traitsSource, component);
}

module.exports = {
  readTraitsSource,
  traitsConstantName,
  traitsLink,
  validateTraitsLink,
};
