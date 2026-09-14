import { createHash } from 'node:crypto';

import { transformSync, type NodePath, type types } from '@babel/core';

import storyTests from '../../config/transform-story-tests.cjs';

const { collectWdioTests, compileWdioTest } = storyTests;

export function extractWdioTests(code: string, sourceFile: string): ReadonlyMap<string, { code: string; digest: string }> {
  const tests = new Map<string, { code: string; digest: string }>();
  transformSync(code, {
    babelrc: false,
    code: false,
    configFile: false,
    filename: sourceFile,
    parserOpts: { plugins: ['typescript', 'jsx'] },
    plugins: [
      () => ({
        visitor: {
          Program(program: NodePath<types.Program>) {
            for (const [exportName, { callback }] of collectWdioTests(program)) {
              const compiled = compileWdioTest(callback, sourceFile, code);
              const source = code.slice(callback.node.start!, callback.node.end!);
              tests.set(exportName, {
                code: compiled,
                digest: createHash('sha256').update(source).update('\0').update(compiled).digest('hex'),
              });
            }
          },
        },
      }),
    ],
  });
  return tests;
}
