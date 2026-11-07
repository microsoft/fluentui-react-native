const { isBuiltin, createRequire } = require('node:module');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const { transformFromAstSync, traverse, types } = require('@babel/core');
const transformTypescript = require('@babel/plugin-transform-typescript');

const nodeGlobals = new Set(
  `AbortController AbortSignal AggregateError Array ArrayBuffer Atomics BigInt BigInt64Array BigUint64Array
  Blob Boolean BroadcastChannel Buffer ByteLengthQueuingStrategy CompressionStream CountQueuingStrategy
  Crypto CryptoKey CustomEvent DOMException DataView Date DecompressionStream Error EvalError Event EventTarget
  File FinalizationRegistry Float16Array Float32Array Float64Array FormData Function Headers Infinity Int8Array
  Int16Array Int32Array Intl JSON Map Math MessageChannel MessageEvent MessagePort NaN Navigator Number Object
  Performance PerformanceEntry PerformanceMark PerformanceMeasure PerformanceObserver PerformanceResourceTiming
  Promise Proxy RangeError ReadableByteStreamController ReadableStream ReadableStreamBYOBReader
  ReadableStreamBYOBRequest ReadableStreamDefaultController ReadableStreamDefaultReader ReferenceError Reflect
  RegExp Request Response Set SharedArrayBuffer String SubtleCrypto Symbol SyntaxError TextDecoder TextDecoderStream
  TextEncoder TextEncoderStream TransformStream TransformStreamDefaultController TypeError URIError URL URLPattern
  URLSearchParams Uint8Array Uint8ClampedArray Uint16Array Uint32Array WeakMap WeakRef WeakSet WebAssembly WebSocket
  WritableStream WritableStreamDefaultController WritableStreamDefaultWriter atob btoa clearImmediate clearInterval
  clearTimeout console crypto decodeURI decodeURIComponent encodeURI encodeURIComponent escape fetch global globalThis
  isFinite isNaN navigator parseFloat parseInt performance process queueMicrotask setImmediate setInterval setTimeout
  structuredClone undefined unescape`.split(/\s+/),
);

function unwrap(expression) {
  while (
    expression &&
    ['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion', 'ParenthesizedExpression'].includes(
      expression.node.type,
    )
  ) {
    expression = expression.get('expression');
  }
  return expression;
}

function keyName(member) {
  const key = member.node.key ?? member.node.property;
  return types.isIdentifier(key) ? key.name : types.isStringLiteral(key) ? key.value : undefined;
}

function fail(location, message) {
  throw location.buildCodeFrameError(`Story wdio: ${message}`);
}

function resolveInitializer(value, seen = new Set(), bindings = new Set()) {
  value = unwrap(value);
  if (value?.isIdentifier()) {
    const binding = value.scope.getBinding(value.node.name);
    if (binding?.path.isVariableDeclarator() && !seen.has(binding)) {
      seen.add(binding);
      bindings.add(binding);
      return resolveInitializer(binding.path.get('init'), seen, bindings);
    }
  }
  return value;
}

function importedDesktopIt(call) {
  const callee = call.get('callee');
  if (!callee.isIdentifier()) fail(call, 'array tests must be direct desktopIt imports.');
  const binding = callee.scope.getBinding(callee.node.name);
  const specifier = binding?.path;
  const declaration = specifier?.parentPath;
  if (
    !specifier?.isImportSpecifier() ||
    (specifier.node.imported.name ?? specifier.node.imported.value) !== 'desktopIt' ||
    !declaration?.isImportDeclaration() ||
    declaration.node.source.value !== '@fluentui-react-native/storybook-desktop/testing' ||
    declaration.node.importKind === 'type' ||
    specifier.node.importKind === 'type'
  ) {
    fail(call, 'array tests must use the desktopIt value imported from @fluentui-react-native/storybook-desktop/testing.');
  }
}

function staticValue(value) {
  value = unwrap(value);
  if (value.isStringLiteral() || value.isBooleanLiteral() || value.isNullLiteral()) return value.node.value;
  if (value.isNumericLiteral() && Number.isFinite(value.node.value)) return value.node.value;
  if (value.isTemplateLiteral() && value.node.expressions.length === 0 && value.node.quasis.length === 1) {
    return value.node.quasis[0].value.cooked;
  }
  if (value.isUnaryExpression({ operator: '-' }) && value.get('argument').isNumericLiteral()) {
    return -value.node.argument.value;
  }
  if (value.isArrayExpression()) {
    return value.get('elements').map((element) => {
      if (!element?.node || element.isSpreadElement()) fail(element ?? value, 'descriptor arrays must contain static values.');
      return staticValue(element);
    });
  }
  if (value.isObjectExpression()) {
    const result = {};
    for (const property of value.get('properties')) {
      if (!property.isObjectProperty() || property.node.computed || property.node.shorthand) {
        fail(property, 'descriptor objects require static key/value properties.');
      }
      const key = keyName(property);
      if (!key || Object.hasOwn(result, key)) fail(property, 'descriptor objects require unique static property names.');
      result[key] = staticValue(property.get('value'));
    }
    return result;
  }
  fail(value, 'descriptor options must be a strict JSON literal.');
}

function collectCallbacks(value) {
  const requireCallback = (callback) => {
    if ((!callback.isArrowFunctionExpression() && !callback.isFunctionExpression()) || callback.node.generator) {
      fail(callback, 'each test must be an inline, non-generator function.');
    }
    return callback;
  };
  if (value.isArrayExpression()) {
    const callbacks = [];
    const names = new Set();
    for (const item of value.get('elements')) {
      if (!item?.node || item.isSpreadElement() || !item.isCallExpression()) {
        fail(item ?? value, 'desktopIt arrays require direct calls and cannot contain holes or spreads.');
      }
      importedDesktopIt(item);
      const args = item.get('arguments');
      if (args.length < 2 || args.length > 3 || args.some((argument) => argument.isSpreadElement())) {
        fail(item, 'desktopIt requires a name, optional static options, and an inline callback.');
      }
      const name = args[0].isStringLiteral() ? args[0].node.value : undefined;
      if (!name?.trim()) fail(args[0], 'desktopIt requires a non-empty literal test name.');
      if (names.has(name)) fail(args[0], `duplicate test name "${name}".`);
      names.add(name);
      const options = args.length === 2 ? {} : staticValue(args[1]);
      if (!options || typeof options !== 'object' || Array.isArray(options)) fail(args[1], 'desktopIt options must be an object.');
      callbacks.push({ name, options, callback: requireCallback(unwrap(args[args.length - 1])) });
    }
    if (!callbacks.length) fail(value, 'a desktopIt array must contain at least one test.');
    return callbacks;
  }
  if (!value.isObjectExpression()) return [{ callback: requireCallback(value) }];
  const callbacks = [];
  const names = new Set();
  for (const member of value.get('properties')) {
    if (!member.isObjectProperty() || member.node.computed) {
      fail(member, 'named tests require static properties, not spreads, computed keys, methods or accessors.');
    }
    const name = keyName(member);
    if (!name || !name.trim()) fail(member, 'named tests require a non-empty name.');
    if (names.has(name)) fail(member, `duplicate test name "${name}".`);
    names.add(name);
    callbacks.push({ name, callback: requireCallback(unwrap(member.get('value'))) });
  }
  if (!callbacks.length) fail(value, 'a named test collection must contain at least one test.');
  return callbacks;
}

/** Shared by the Node extractor and Metro; inspect only named CSF story objects. */
function collectWdioTests(program) {
  const exports = [];
  const storyBindings = new Set();
  const tests = new Map();
  for (const statement of program.get('body')) {
    if (statement.isExportDefaultDeclaration()) {
      const value = resolveInitializer(statement.get('declaration'));
      const test = value?.isObjectExpression() && value.get('properties').find((member) => keyName(member) === 'wdio');
      if (test) fail(test, 'callbacks belong on named CSF3 story exports, not the default meta export.');
    }
    if (!statement.isExportNamedDeclaration() || statement.node.exportKind === 'type') continue;
    const declaration = statement.get('declaration');
    if (declaration?.isVariableDeclaration()) {
      for (const variable of declaration.get('declarations')) {
        if (!variable.get('id').isIdentifier()) continue;
        storyBindings.add(variable.scope.getBinding(variable.node.id.name));
        exports.push([variable.node.id.name, variable.get('init')]);
      }
    }
    if (!statement.node.source) {
      for (const specifier of statement.get('specifiers')) {
        if (!specifier.isExportSpecifier() || specifier.node.exportKind === 'type') continue;
        storyBindings.add(specifier.scope.getBinding(specifier.node.local.name));
        exports.push([specifier.node.exported.name ?? specifier.node.exported.value, specifier.get('local')]);
      }
    }
  }
  for (const [exportName, initializer] of exports) {
    const object = resolveInitializer(initializer, new Set(), storyBindings);
    if (!object?.node) continue;
    if (!object.isObjectExpression()) {
      if (object.isFunction()) continue;
      object.traverse({
        Function(inner) {
          inner.skip();
        },
        'ObjectProperty|ObjectMethod'(member) {
          if (keyName(member) === 'wdio') fail(member, `"${exportName}" must be a directly exported CSF3 object literal.`);
        },
      });
      continue;
    }
    let test;
    for (const member of object.get('properties')) {
      if (member.isSpreadElement()) fail(member, `"${exportName}" uses a spread that could hide or override wdio.`);
      if (member.node.computed) fail(member, `"${exportName}" uses a computed property that could hide or override wdio.`);
      if (keyName(member) !== 'wdio') continue;
      if (test) fail(member, `"${exportName}" has duplicate wdio properties.`);
      if (!member.isObjectProperty()) fail(member, `"${exportName}".wdio must be an inline function value, not a method or accessor.`);
      const value = unwrap(member.get('value'));
      test = { callbacks: collectCallbacks(value), property: member, value };
    }
    if (test) {
      const declaration = object.findParent((parent) => parent.isVariableDeclarator());
      const binding = declaration?.get('id').isIdentifier() && declaration.scope.getBinding(declaration.node.id.name);
      if (binding && !binding.constant) fail(object, `"${exportName}" is reassigned; wdio requires an immutable story declaration.`);
      tests.set(exportName, test);
    }
  }
  program.traverse({
    AssignmentExpression(assignment) {
      const target = assignment.get('left');
      if (
        target.isMemberExpression() &&
        target.get('object').isIdentifier() &&
        storyBindings.has(target.scope.getBinding(target.node.object.name)) &&
        (target.node.computed || keyName(target) === 'wdio')
      ) {
        fail(target, 'assign wdio inside the exported CSF3 object, not through a later property assignment.');
      }
    },
    CallExpression(call) {
      const callee = call.get('callee');
      const target = call.get('arguments.0');
      if (
        callee.isMemberExpression() &&
        callee.get('object').isIdentifier({ name: 'Object' }) &&
        ['assign', 'defineProperty', 'defineProperties'].includes(keyName(callee)) &&
        target?.isIdentifier() &&
        storyBindings.has(target.scope.getBinding(target.node.name))
      ) {
        fail(call, 'Object mutations could hide or override wdio; author properties inside the exported CSF3 object.');
      }
    },
  });
  return tests;
}

// The physical requirement each WebDriver action source type implies, in the order messages list them.
const actionSourceRequirements = { key: 'keyboard', pointer: 'physical-click', wheel: 'wheel' };
const requirementInputKinds = { keyboard: 'keyboard', 'physical-click': 'pointer', wheel: 'wheel' };
const valueCommands = new Set(['setValue', 'addValue', 'clearValue']);

function memberName(callee) {
  const property = callee.node.property;
  if (!callee.node.computed) return types.isIdentifier(property) ? property.name : undefined;
  if (types.isStringLiteral(property)) return property.value;
  return types.isTemplateLiteral(property) && property.expressions.length === 0 ? property.quasis[0].value.cooked : undefined;
}

function isBrowser(object) {
  object = unwrap(object);
  if (object.isIdentifier({ name: 'browser' })) return true;
  return (object.isMemberExpression() || object.isOptionalMemberExpression()) && memberName(object) === 'browser';
}

/** Follows a constant to the value it holds, so a payload declared above the call is still read. */
function readConstant(value, seen = new Set()) {
  value = unwrap(value);
  if (value.isIdentifier()) {
    const binding = value.scope.getBinding(value.node.name);
    const declarator = binding?.path;
    if (
      binding?.constant &&
      declarator?.isVariableDeclarator() &&
      declarator.node.init &&
      declarator.get('id').isIdentifier() &&
      !seen.has(binding)
    ) {
      seen.add(binding);
      return readConstant(declarator.get('init'), seen);
    }
  }
  return value;
}

function readString(value) {
  value = readConstant(value);
  if (value.isStringLiteral()) return value.node.value;
  return value.isTemplateLiteral() && value.node.expressions.length === 0 ? value.node.quasis[0].value.cooked : undefined;
}

function actionSourceType(source) {
  source = readConstant(source);
  if (!source.isObjectExpression()) return undefined;
  let type;
  for (const property of source.get('properties')) {
    // A spread or a computed key could supply or replace the type.
    if (!property.isObjectProperty() || property.node.computed) return undefined;
    if (keyName(property) === 'type') type = readString(property.get('value'));
  }
  return type;
}

/** The physical requirements of a WebDriver action payload, and whether every source in it could be read. */
function readActionSources(payload) {
  payload = readConstant(payload);
  if (!payload.isArrayExpression()) return undefined;
  const requires = new Set();
  let readable = true;
  for (const element of payload.get('elements')) {
    const type = element?.node && !element.isSpreadElement() ? actionSourceType(element) : undefined;
    if (type === undefined) readable = false;
    else if (Object.hasOwn(actionSourceRequirements, type)) requires.add(actionSourceRequirements[type]);
  }
  return { requires: Object.values(actionSourceRequirements).filter((requirement) => requires.has(requirement)), readable };
}

/** A call that sends physical input, with the requirements that input implies. Those are undefined when the call cannot be read. */
function directInputCall(call) {
  const callee = call.get('callee');
  if (!callee.isMemberExpression() && !callee.isOptionalMemberExpression()) return undefined;
  const name = memberName(callee);
  const argument = call.node.arguments[0] ? call.get('arguments.0') : undefined;
  if (valueCommands.has(name)) return { call: name, requires: ['keyboard'] };
  if (name === 'keys' && isBrowser(callee.get('object'))) return { call: 'browser.keys', requires: ['keyboard'] };
  if (name === 'action' && isBrowser(callee.get('object'))) {
    const type = argument && readString(argument);
    if (type === undefined) return { call: 'browser.action', requires: undefined };
    return Object.hasOwn(actionSourceRequirements, type)
      ? { call: 'browser.action', requires: [actionSourceRequirements[type]] }
      : undefined;
  }
  if (name === 'performActions') {
    const sources = argument && readActionSources(argument);
    if (!sources) return { call: 'performActions', requires: undefined };
    if (sources.requires.length) return { call: 'performActions', requires: sources.requires };
    return sources.readable ? undefined : { call: 'performActions', requires: undefined };
  }
  return undefined;
}

/**
 * Rejects a case that also runs in the accessible input lane but sends physical input itself: the keyboard commands, the value
 * commands that may type, and WebDriver actions with key, pointer or wheel sources. The check reads literals only. Input sent
 * through a helper or an alias is stopped by the accessible lane's host masks when the case runs.
 */
function rejectDirectInput(callback, { name, input, inputSource }) {
  if (input === 'physical') return;
  let finding;
  callback.traverse({
    'CallExpression|OptionalCallExpression'(call) {
      const found = finding ? undefined : directInputCall(call);
      if (found) finding = { ...found, path: call };
    },
  });
  if (!finding) return;
  const subject = name ? `"${name}"` : 'This case';
  const declared = inputSource === 'declared';
  if (finding.requires === undefined) {
    const declaration = declared ? "input: 'physical'" : 'requires for the physical input it sends (keyboard, physical-click or wheel)';
    fail(
      finding.path,
      `${subject} runs in the accessible input lane, but calls ${finding.call} with an argument this check cannot read. ` +
        `Pass a literal list of input sources, or declare ${declaration}.`,
    );
  }
  const kinds = finding.requires.map((requirement) => requirementInputKinds[requirement]).join(' and ');
  const declaration = declared
    ? "input: 'physical'"
    : `requires: [${finding.requires.map((requirement) => `'${requirement}'`).join(', ')}]`;
  fail(
    finding.path,
    `${subject} runs in the accessible input lane, but ${finding.call} sends physical ${kinds} input. ` +
      `Declare ${declaration} so it runs only in the physical lane, or remove the call.`,
  );
}

function compileWdioTest(callback, sourceFile, source) {
  const file = types.file(types.program([types.expressionStatement(types.cloneNode(callback.node, true))]));
  const result = transformFromAstSync(file, source, {
    ast: true,
    babelrc: false,
    code: false,
    configFile: false,
    filename: sourceFile,
    plugins: [[transformTypescript, { allowDeclareFields: true, onlyRemoveTypeImports: true, isTSX: true }]],
  });
  const requireFromSource = createRequire(path.resolve(sourceFile));
  function checkReference(reference, name) {
    if (reference.scope.getBinding(name)) return;
    if (name === 'arguments' && reference.findParent((parent) => parent.isFunction() && !parent.isArrowFunctionExpression())) return;
    if (callback.scope.getBinding(name)) {
      fail(
        reference,
        `"${name}" closes over a story-module binding. Declare it inside wdio or use a literal import() inside the callback.`,
      );
    }
    if (!nodeGlobals.has(name)) fail(reference, `"${name}" is not a callback-local binding or supported Node global.`);
  }
  function rewriteImport(importPath, argument) {
    if (!argument?.isStringLiteral()) fail(importPath, 'import() requires one literal string specifier.');
    const specifier = argument.node.value;
    if (/^(?:react-native(?:$|[/-])|@office-iss\/react-native-win32(?:$|\/))/.test(specifier)) {
      fail(importPath, 'React Native modules cannot be imported by a Node wdio callback.');
    }
    let resolved;
    try {
      resolved = isBuiltin(specifier)
        ? specifier.startsWith('node:')
          ? specifier
          : `node:${specifier}`
        : pathToFileURL(requireFromSource.resolve(specifier)).href;
    } catch (error) {
      fail(importPath, `cannot resolve import "${specifier}" from ${sourceFile}: ${error.message}`);
    }
    if (/\.[jt]sx(?:$|[?#])/.test(resolved)) fail(importPath, 'import() helpers must be Node-loadable modules, not JSX/TSX files.');
    argument.replaceWith(types.stringLiteral(resolved));
  }
  traverse(result.ast, {
    ReferencedIdentifier(reference) {
      checkReference(reference, reference.node.name);
    },
    AssignmentExpression(assignment) {
      for (const name of Object.keys(types.getBindingIdentifiers(assignment.node.left))) checkReference(assignment, name);
    },
    UpdateExpression(update) {
      if (types.isIdentifier(update.node.argument)) checkReference(update, update.node.argument.name);
    },
    'ForInStatement|ForOfStatement'(loop) {
      if (!types.isVariableDeclaration(loop.node.left)) {
        for (const name of Object.keys(types.getBindingIdentifiers(loop.node.left))) checkReference(loop, name);
      }
    },
    'JSXElement|JSXFragment'(jsx) {
      fail(jsx, 'JSX belongs in the native render module, not a Node wdio callback.');
    },
    ThisExpression(reference) {
      for (let child = reference, parent = child.parentPath; parent; child = parent, parent = parent.parentPath) {
        if (parent.isFunction() && !parent.isArrowFunctionExpression() && !(parent.isMethod() && child.key === 'key')) return;
        if (
          parent.isStaticBlock() ||
          ((parent.isClassProperty() || parent.isClassPrivateProperty() || parent.isClassAccessorProperty()) && child.key === 'value')
        ) {
          return;
        }
      }
      fail(reference, '"ThisExpression" closes over the story module rather than callback-local state.');
    },
    MetaProperty(reference) {
      if (reference.node.meta.name === 'new') return;
      fail(reference, `"${reference.node.type}" is not supported in an isolated wdio callback.`);
    },
    CallExpression(call) {
      if (!types.isImport(call.node.callee)) return;
      if (call.node.arguments.length !== 1) fail(call, 'import() requires one literal string specifier.');
      rewriteImport(call, call.get('arguments.0'));
    },
    ImportExpression(importPath) {
      if (importPath.node.options) fail(importPath, 'import() options are not supported.');
      rewriteImport(importPath, importPath.get('source'));
    },
  });
  const generated = transformFromAstSync(result.ast, source, {
    babelrc: false,
    configFile: false,
    filename: sourceFile,
    comments: false,
  }).code;
  // The expression statement's parentheses are significant for named function expressions.
  return generated.replace(/;\s*$/, '');
}

module.exports = () => ({
  name: 'transform-story-tests',
  visitor: {
    Program(program, state) {
      const filename = state.filename ?? state.file.opts.filename;
      if (!filename || !/\.stories\.tsx?$/.test(filename)) return;
      const tests = collectWdioTests(program);
      for (const { callbacks } of tests.values()) {
        for (const { callback } of callbacks) compileWdioTest(callback, filename, state.file.code);
      }
      for (const { property } of tests.values()) if (!property.removed) property.remove();
      program.scope.crawl();
      for (const statement of program.get('body')) {
        if (!statement.isImportDeclaration() || statement.node.source.value !== '@fluentui-react-native/storybook-desktop/testing')
          continue;
        for (const specifier of statement.get('specifiers')) {
          if (!specifier.isImportSpecifier() || (specifier.node.imported.name ?? specifier.node.imported.value) !== 'desktopIt') continue;
          const binding = statement.scope.getBinding(specifier.node.local.name);
          if (!binding?.referencePaths.length) specifier.remove();
        }
        if (!statement.node.specifiers.length) statement.remove();
      }
    },
  },
});

module.exports.collectWdioTests = collectWdioTests;
module.exports.compileWdioTest = compileWdioTest;
module.exports.rejectDirectInput = rejectDirectInput;
