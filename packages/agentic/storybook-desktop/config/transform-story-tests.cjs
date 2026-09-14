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
      const callback = unwrap(member.get('value'));
      if ((!callback.isArrowFunctionExpression() && !callback.isFunctionExpression()) || callback.node.generator) {
        fail(member, `"${exportName}".wdio must be an inline, non-generator function.`);
      }
      test = { callback, property: member };
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
      for (const { callback } of tests.values()) compileWdioTest(callback, filename, state.file.code);
      for (const { property } of tests.values()) if (!property.removed) property.remove();
    },
  },
});

module.exports.collectWdioTests = collectWdioTests;
module.exports.compileWdioTest = compileWdioTest;
