import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

import { extractWdioTests } from './extractWdioTests.js';

const sourceFile = path.resolve(__dirname, 'fixture.stories.tsx');

describe('extractWdioTests', () => {
  test('extracts named test functions in declaration order with independent local scopes', async () => {
    const result = extractWdioTests(
      `
      import Native from 'react-native-not-loaded';
      export const Example = { render: () => <Native />, wdio: {
        'first case': async ({ expect, platform }) => { expect(platform).toBe('win32'); },
        'second case': async ({ browser }) => { await browser.$('~button'); },
      } };
    `,
      sourceFile,
    ).get('Example')!;
    expect(result.tests.map(({ name }) => name)).toEqual(['first case', 'second case']);
    const assertion = jest.fn();
    await vm.runInNewContext(`(${result.tests[0].code})`)({ platform: 'win32', expect: () => ({ toBe: assertion }) });
    expect(assertion).toHaveBeenCalledWith('win32');
    expect(() => extractWdioTests(`const shared = 1; export const Example = { wdio: { named: () => shared } };`, sourceFile)).toThrow(
      /story-module binding/,
    );
    const source = `export const Example = { wdio: { first: () => {}, second: () => {} } };`;
    expect(extractWdioTests(source, sourceFile).get('Example')!.digest).not.toBe(
      extractWdioTests(source.replace('second:', 'renamed:'), sourceFile).get('Example')!.digest,
    );
  });

  test('extracts desktopIt calls and their static descriptors without executing the story', () => {
    const result = extractWdioTests(
      `
      import { desktopIt as test } from '@fluentui-react-native/storybook-desktop/testing';
      export const Example = { wdio: [
        test('accessible action', { requires: ['click'], platforms: ['!win32'] }, async ({ browser }) => { await browser.$('~button').click(); }),
        test('default case', async () => {}),
      ] };
      `,
      sourceFile,
    ).get('Example')!;
    expect(result.tests.map(({ name, options }) => ({ name, input: options?.input, requires: options?.requires }))).toEqual([
      { name: 'accessible action', input: 'both', requires: ['click'] },
      { name: 'default case', input: 'both', requires: undefined },
    ]);
  });

  test.each([
    ['{}', /at least one/],
    ["{ '': () => {} }", /non-empty/],
    ['{ a: () => {}, a: () => {} }', /duplicate test name/],
    ['{ ...shared }', /static properties/],
    ["{ ['name']: () => {} }", /static properties/],
    ['{ named() {} }', /static properties/],
    ['{ named: helper }', /inline/],
    ['{ named: { nested: () => {} } }', /inline/],
  ])('rejects invalid named collections %s', (value, message) => {
    expect(() => extractWdioTests(`export const Example = { wdio: ${value} };`, sourceFile)).toThrow(message);
  });

  test.each([
    [`export const Example = { wdio: [desktopIt('case', () => {})] };`, /imported from/],
    [
      `import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing'; export const Example = { wdio: [desktopIt('case', { input: mode }, () => {})] };`,
      /strict JSON literal/,
    ],
    [
      `import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing'; const name = 'case'; export const Example = { wdio: [desktopIt(name, () => {})] };`,
      /literal test name/,
    ],
  ])('rejects non-static desktopIt descriptors', (source, message) => {
    expect(() => extractWdioTests(source, sourceFile)).toThrow(message);
  });

  test('extracts a standalone typed callback without loading the native story module', async () => {
    const tests = extractWdioTests(
      `
      import { NativeComponent } from 'react-native-module-that-must-not-load';
      import type { Story, TestContext } from 'types-that-must-not-load';
      throw new Error('the render module must never execute');
      export default { component: NativeComponent };
      export const Example: Story = {
        render: () => <NativeComponent />,
        wdio: (async ({ browser }: TestContext): Promise<void> => {
          const selector: string = '~example';
          const local = async (value: string) => browser.$(value);
          await (await local(selector)).click();
        }) satisfies TestContext['callback'],
      } satisfies Story;
      `,
      sourceFile,
    );
    expect([...tests.keys()]).toEqual(['Example']);
    const { tests: callbacks, digest } = tests.get('Example')!;
    expect(callbacks).toHaveLength(1);
    const { code } = callbacks[0];
    expect(code).not.toMatch(/TestContext|Promise<void>|: string|NativeComponent/);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    const click = jest.fn();
    const select = jest.fn().mockResolvedValue({ click });
    await vm.runInNewContext(`(${code})`)({ browser: { $: select } });
    expect(select).toHaveBeenCalledWith('~example');
    expect(click).toHaveBeenCalledTimes(1);
  });

  test('supports satisfies, assertions, local declarations, and named export aliases', () => {
    const tests = extractWdioTests(
      `
      const local: Story = ({
        wdio: function check({ expect }: Context) {
          type Value = { count: number };
          const value: Value = { count: 1 };
          class Counter { value = value; }
          const nested = () => new Counter().value.count;
          expect(nested()).toBe(1);
        },
      } as Story)!;
      export { local as Renamed };
      `,
      sourceFile,
    );
    expect([...tests.keys()]).toEqual(['Renamed']);
    expect(tests.get('Renamed')!.tests[0].code).toContain('function check');
    expect(() => vm.runInNewContext(`(${tests.get('Renamed')!.tests[0].code})`)).not.toThrow();
  });

  test('resolves literal helper imports from the original file and normalizes Node builtins', () => {
    const { code } = extractWdioTests(
      `export const Example = { wdio: async () => {
        const assert = await import('assert/strict');
        const { types } = await import('@babel/core');
        await import('./types.ts');
        assert.ok(types.isIdentifier(types.identifier('example')));
      } };`,
      sourceFile,
    ).get('Example')!.tests[0];
    const requireFromSource = createRequire(sourceFile);
    expect(code).toContain('node:assert/strict');
    expect(code).toContain(pathToFileURL(requireFromSource.resolve('@babel/core')).href);
    expect(code).toContain(pathToFileURL(requireFromSource.resolve('./types.ts')).href);
  });

  test('runs extracted builtin and bare helper imports in an isolated Node module', () => {
    const { code } = extractWdioTests(
      `export const Example = { wdio: async () => {
        const assert = await import('node:assert/strict');
        const { types } = await import('@babel/core');
        assert.ok(types.isIdentifier(types.identifier('example')));
      } };`,
      sourceFile,
    ).get('Example')!.tests[0];
    const result = spawnSync(process.execPath, ['--input-type=module', '--eval', `await (${code})({});`], { encoding: 'utf8' });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  test('allows Node globals and nested callback-local closures', () => {
    expect(() =>
      extractWdioTests(
        `const value = 'outside';
        export const Example = { wdio: async ({ expect }) => {
          const value = Buffer.from('inside');
          const local = () => value.toString();
          await new Promise((resolve) => setTimeout(resolve, 0));
          console.log(process.version, globalThis, new URL('https://example.com'));
          expect(local()).toBe('inside');
        } };`,
        sourceFile,
      ),
    ).not.toThrow();
  });

  test('allows locally bound this, arguments, super, and new.target', async () => {
    const { code } = extractWdioTests(
      `export const Example = { wdio: function () {
        class Base { value = 1; }
        class Local extends Base {
          constructor() { super(); this.value++; }
          read() { return (() => this.value)(); }
        }
        function constructorTarget() { return new.target; }
        function first() { return arguments[0]; }
        return first(new Local().read()) + (new constructorTarget() === constructorTarget ? 1 : 0);
      } };`,
      sourceFile,
    ).get('Example')!.tests[0];
    expect(await vm.runInNewContext(`(${code})`)()).toBe(3);
  });

  test.each([
    ['an imported closure', `import { helper } from './render';`, `async () => helper()`, /helper.*story-module binding/],
    ['a module constant', `const selector = '~button';`, `async ({ browser }) => browser.$(selector)`, /selector.*story-module binding/],
    ['a shadowed global', `const process = { version: 1 };`, `() => process.version`, /process.*story-module binding/],
    ['an unknown global', '', `() => window.location`, /window.*Node global/],
    ['require', '', `() => require('node:fs')`, /require.*Node global/],
    ['an unbound assignment', '', `() => { missing = 1; }`, /missing.*Node global/],
    ['an unbound destructuring assignment', '', `() => { ({ value: missing } = {}); }`, /missing.*Node global/],
    ['an unbound update', '', `() => missing++`, /missing.*Node global/],
    ['an unbound for-of variable', '', `() => { for (missing of []) {} }`, /missing.*Node global/],
    ['JSX', '', `() => <View />`, /JSX/],
    ['JSX fragments', '', `() => <></>`, /JSX/],
    ['lexical this', '', `() => this.value`, /ThisExpression/],
    ['lexical this in a class base', '', `() => { class Local extends this.Base {} return Local; }`, /ThisExpression/],
    ['lexical this in a computed class method', '', `() => { class Local { [this.key]() {} } return Local; }`, /ThisExpression/],
    ['lexical this in a computed object method', '', `() => ({ [this.key]() {} })`, /ThisExpression/],
    ['module location', '', `() => import.meta.url`, /MetaProperty/],
    ['lexical arguments', '', `() => arguments[0]`, /arguments.*Node global/],
    ['a dynamic import', '', `async ({ browser }) => import(browser.name)`, /literal string/],
    ['a template import', '', 'async () => import(`node:fs`)', /literal string/],
    ['an unresolved import', '', `async () => import('missing-wdio-helper-package')`, /cannot resolve import/],
    ['a native import', '', `async () => import('react-native')`, /React Native/],
    ['a Windows native import', '', `async () => import('react-native-windows')`, /React Native/],
  ])('rejects %s with source context', (_name, prefix, callback, message) => {
    const source = `${prefix}\nexport const Example = {\n  wdio: ${callback},\n};`;
    let error: Error | undefined;
    try {
      extractWdioTests(source, sourceFile);
    } catch (caught) {
      error = caught as Error;
    }
    expect(error?.message).toMatch(message);
    expect(error?.message).toContain(sourceFile);
    expect(error?.message).toContain('3 |');
  });

  test.each([
    [`{ wdio: callback }`, /inline/],
    [`{ wdio: makeCallback() }`, /inline/],
    [`{ wdio: true }`, /inline/],
    [`{ wdio: () => {}, wdio: () => {} }`, /duplicate/],
    [`{ wdio: () => {}, 'wdio': () => {} }`, /duplicate/],
    [`{ async wdio() {} }`, /method or accessor/],
    [`{ get wdio() { return () => {}; } }`, /method or accessor/],
    [`{ wdio: function* () {} }`, /non-generator/],
    [`{ ...shared, wdio: () => {} }`, /spread/],
    [`{ wdio: () => {}, ...shared }`, /spread/],
    [`{ ...shared }`, /spread/],
    [`{ ['wdio']: () => {} }`, /computed/],
    [`{ [key]: () => {} }`, /computed/],
    [`makeStory({ wdio: () => {} })`, /object literal/],
  ])('rejects unsupported authoring %s', (story, message) => {
    expect(() => extractWdioTests(`export const Example = ${story};`, sourceFile)).toThrow(message);
  });

  test('rejects later callback assignments and callbacks on the default meta', () => {
    expect(() => extractWdioTests(`export const Example = {}; Example.wdio = () => {};`, sourceFile)).toThrow(/property assignment/);
    expect(() => extractWdioTests(`export default { wdio: () => {} };`, sourceFile)).toThrow(/default meta/);
    expect(() =>
      extractWdioTests(`const local = {}; const alias = local; export { alias as Example }; local.wdio = () => {};`, sourceFile),
    ).toThrow(/property assignment/);
    expect(() => extractWdioTests(`export let Example = { wdio: () => {} }; Example = {};`, sourceFile)).toThrow(/reassigned/);
    expect(() => extractWdioTests(`export const Example = {}; Object.assign(Example, { wdio: () => {} });`, sourceFile)).toThrow(
      /Object mutations/,
    );
  });

  test('does not extract nested unrelated properties', () => {
    expect(
      extractWdioTests(
        `export const Example = { args: { wdio: 'arg' }, parameters: { wdio: () => 'parameter' }, render: () => ({ wdio: 'render' }) };`,
        sourceFile,
      ).size,
    ).toBe(0);
    expect(
      extractWdioTests(
        `export const Example = () => {
          const Example = { wdio: 'unrelated' };
          Example.wdio = 'keep';
          return Example;
        };`,
        sourceFile,
      ).size,
    ).toBe(0);
  });

  test('digests track callback source but not render-only changes', () => {
    const source = `export const Example = { args: { count: 1 }, wdio: () => console.log('test') };`;
    const digest = (code: string) => extractWdioTests(code, sourceFile).get('Example')!.digest;
    expect(digest(source.replace('count: 1', 'count: 2'))).toBe(digest(source));
    expect(digest(source.replace("'test'", "'changed'"))).not.toBe(digest(source));
    expect(digest(source.replace('console.log', '/* source change */ console.log'))).not.toBe(digest(source));
  });

  describe('direct physical input', () => {
    const desktopCase = (body: string, options?: string) =>
      `import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
      export const Example = { wdio: [desktopIt('case', ${options === undefined ? '' : `${options}, `}async (context) => { const { browser } = context; ${body} })] };`;
    const key = `{ type: 'key', id: 'keyboard', actions: [{ type: 'keyDown', value: 'a' }] }`;
    const pointer = `{ type: 'pointer', id: 'mouse', actions: [{ type: 'pointerMove', x: 1, y: 1 }] }`;
    const wheel = `{ type: 'wheel', id: 'wheel', actions: [{ type: 'scroll', deltaY: 10 }] }`;
    const pause = `{ type: 'none', id: 'pause', actions: [{ type: 'pause', duration: 100 }] }`;

    test.each([
      ['browser.keys', `await browser.keys('a');`, /browser\.keys sends physical keyboard input.*requires: \['keyboard'\]/],
      ['an optional browser.keys', `await browser?.keys('a');`, /browser\.keys sends physical keyboard input/],
      ['a computed browser.keys', `await browser['keys']('a');`, /browser\.keys sends physical keyboard input/],
      ['a keys call through the context', `await context.browser.keys('a');`, /browser\.keys sends physical keyboard input/],
      ['setValue', `await (await browser.$('~input')).setValue('a');`, /setValue sends physical keyboard input/],
      ['addValue', `await (await browser.$('~input')).addValue('a');`, /addValue sends physical keyboard input/],
      ['clearValue', `await (await browser.$('~input')).clearValue();`, /clearValue sends physical keyboard input/],
      ['key actions', `await browser.performActions([${key}]);`, /performActions sends physical keyboard input/],
      ['pointer actions', `await browser.performActions([${pointer}]);`, /sends physical pointer input.*requires: \['physical-click'\]/],
      ['wheel actions', `await browser.performActions([${wheel}]);`, /sends physical wheel input.*requires: \['wheel'\]/],
      [
        'actions with several physical sources',
        `await browser.performActions([${wheel}, ${pause}, ${key}]);`,
        /sends physical keyboard and wheel input.*requires: \['keyboard', 'wheel'\]/,
      ],
      [
        'actions held in a constant',
        `const actions = [${pointer}]; await browser.performActions(actions);`,
        /sends physical pointer input/,
      ],
      ['an action builder', `await browser.action('key').down('a').perform();`, /browser\.action sends physical keyboard input/],
      [
        'a call inside a nested function',
        `await browser.waitUntil(async () => { await browser.keys('a'); return true; });`,
        /browser\.keys sends physical keyboard input/,
      ],
      [
        'actions built elsewhere',
        `const buildActions = () => []; await browser.performActions(buildActions());`,
        /performActions with an argument this check cannot read/,
      ],
      ['actions held in a variable that changes', `let actions = []; actions = [1]; await browser.performActions(actions);`, /cannot read/],
      ['actions with a spread source', `const sources = []; await browser.performActions([...sources]);`, /cannot read/],
      [
        'actions with a source that has a spread',
        `const source = {}; await browser.performActions([{ ...source, id: 'a' }]);`,
        /cannot read/,
      ],
      ['actions without an argument', `await browser.performActions();`, /cannot read/],
      [
        'an action builder with a variable type',
        `await browser.action(context.type).perform();`,
        /browser\.action with an argument this check cannot read/,
      ],
    ])('rejects %s in a case that also runs in the accessible lane', (_name, body, message) => {
      expect(() => extractWdioTests(desktopCase(body), sourceFile)).toThrow(message);
    });

    test.each([
      ['an explicit both', `{ input: 'both' }`],
      ['an explicit accessible case', `{ input: 'accessible' }`],
      ['an accessibility click', `{ requires: ['accessibility-click'] }`],
      ['neutral requirements', `{ requires: ['click', 'focus'] }`],
    ])('rejects the keyboard in %s with the case name and source location', (_name, options) => {
      let error: Error | undefined;
      try {
        extractWdioTests(desktopCase(`await browser.keys('a');`, options), sourceFile);
      } catch (caught) {
        error = caught as Error;
      }
      expect(error?.message).toContain('"case" runs in the accessible input lane');
      expect(error?.message).toContain(sourceFile);
    });

    test('suggests the declaration that matches how the case chose its input', () => {
      expect(() => extractWdioTests(desktopCase(`await browser.keys('a');`, `{ input: 'both' }`), sourceFile)).toThrow(
        /Declare input: 'physical'/,
      );
      expect(() => extractWdioTests(desktopCase(`await browser.keys('a');`), sourceFile)).toThrow(/Declare requires: \['keyboard'\]/);
    });

    test.each([
      ['derives physical from keyboard', `{ requires: ['keyboard'] }`],
      ['derives physical from a physical click', `{ requires: ['physical-click', 'wheel'] }`],
      ['declares physical', `{ input: 'physical' }`],
    ])('allows direct input in a case that %s', (_name, options) => {
      const body = `await browser.keys('a'); await (await browser.$('~input')).setValue('a'); await browser.performActions([${key}, ${pointer}, ${wheel}]);`;
      expect(() => extractWdioTests(desktopCase(body, options), sourceFile)).not.toThrow();
    });

    test('allows calls that do not send physical input', () => {
      const body = `
        const names = Object.keys({ a: 1 });
        const map = new Map([[1, 2]]);
        for (const entry of map.keys()) names.push(String(entry));
        await browser.performActions([${pause}]);
        await browser.performActions([]);
        const store = { setValueLater: () => {} };
        store.setValueLater();
        await (await browser.$('~button')).click();
      `;
      expect(() => extractWdioTests(desktopCase(body), sourceFile)).not.toThrow();
    });

    test('does not read legacy callbacks, which declare no input', () => {
      expect(() =>
        extractWdioTests(`export const Example = { wdio: { legacy: async ({ browser }) => { await browser.keys('a'); } } };`, sourceFile),
      ).not.toThrow();
    });
  });
});
