import path from 'node:path';

import { transformSync } from '@babel/core';

const { createDesktopStorybookBabelConfig } = require('../../config/babel.cjs');

function transform(code: string, platform = 'macos', filename = 'button.stories.tsx') {
  return transformSync(code, {
    ...createDesktopStorybookBabelConfig({ caller: (select: (caller: { platform: string }) => string) => select({ platform }) }),
    babelrc: false,
    configFile: false,
    filename: path.join(__dirname, filename),
  })!.code!;
}

describe('native Storybook test stripping', () => {
  test.each(['macos', 'windows', 'win32'])(
    'strips only top-level story callbacks before native imports are collected on %s',
    (platform) => {
      const output = transform(
        `
      import { View } from 'react-native';
      import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
      export default { title: 'Button', component: View };
      export const Example: WdioStory = {
        args: { wdio: 'keep-arg' },
        parameters: { wdio: () => 'keep-parameter' },
        render: () => <View testID="keep-render" />,
        wdio: async ({ browser }: Context): Promise<void> => {
          const assert = await import('node:assert');
          const helper = await import('@babel/core');
          const button: unknown = await browser.$('~button');
          assert.ok(button);
          console.log(helper.version);
        },
      } satisfies WdioStory;
      `,
        platform,
      );
      expect(output).not.toMatch(/node:assert|@babel\/core|storybook-desktop\/testing|Context|Promise<void>/);
      expect(output).toContain('react-native');
      expect(output).toContain('keep-render');
      expect(output).toContain('keep-arg');
      expect(output).toContain('keep-parameter');
      expect(output).not.toContain('~button');
    },
  );

  test('preserves ordinary render code and nested wdio objects', () => {
    const story = `
      import { View } from 'react-native';
      export default { component: View };
      export const Example = { render: () => <View testID="button" />, args: { wdio: 'arg' } CALLBACK };
    `;
    expect(transform(story.replace('CALLBACK', ', wdio: () => console.log(process.version)'))).toBe(
      transform(story.replace('CALLBACK', '')),
    );
  });

  test.each(['macos', 'windows', 'win32'])('strips every named test and its Node dependencies on %s', (platform) => {
    const output = transform(
      `
      import { View } from 'react-native';
      export const Example = { render: () => <View testID="keep-native" />, wdio: {
        'first test': async ({ platform }) => { const assert = await import('node:assert'); assert.ok(platform); },
        'second test': async () => { await import('node:fs'); },
      } };
    `,
      platform,
    );
    expect(output).toContain('keep-native');
    expect(output).not.toMatch(/first test|second test|node:assert|node:fs|wdio/);
  });

  test('leaves non-story files untouched', () => {
    const output = transform(`export const configuration = { wdio: () => 'not-a-story' };`, 'macos', 'configuration.ts');
    expect(output).toContain('wdio');
    expect(output).toContain('not-a-story');
  });

  test('strips local object exports and multiple aliases without double-removing a property', () => {
    const output = transform(`const local = { wdio: () => console.log('remove-me'), args: {} }; export { local as One, local as Two };`);
    expect(output).not.toContain('remove-me');
    expect(output).not.toContain('wdio');
    expect(output).toContain('One');
    expect(output).toContain('Two');
  });

  test.each([
    [`export const Example = { wdio: importedCallback };`, /inline/],
    [`export const Example = { ...shared };`, /spread/],
    [`export const Example = { ['wdio']: () => {} };`, /computed/],
    [`export const Example = { wdio: () => {}, wdio: () => {} };`, /duplicate/],
    [`export const Example = { wdio: async ({ browser }) => import(browser.name) };`, /literal string/],
    [`import { helper } from 'render-helper'; export const Example = { wdio: () => helper() };`, /story-module binding/],
    [`export const Example = { wdio: () => <View /> };`, /JSX/],
  ])('fails closed for unsupported native authoring', (source, message) => {
    expect(() => transform(source)).toThrow(message);
    expect(() => transform(source)).toThrow(/button\.stories\.tsx/);
  });

  test('retains Win32 Unicode regex compatibility without applying it to macOS', () => {
    const source = `export const Example = { render: () => new RegExp('\\\\p{Letter}', 'u').test('a'), wdio: () => console.log('remove') };`;
    expect(transform(source, 'macos')).toContain('p{Letter}');
    expect(transform(source, 'win32')).not.toContain('p{Letter}');
    expect(transform(source, 'win32')).not.toContain('remove');
  });
});
