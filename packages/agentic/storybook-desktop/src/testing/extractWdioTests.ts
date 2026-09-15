import { createHash } from 'node:crypto';

import { transformSync, type NodePath, type types } from '@babel/core';

import storyTests from '../../config/transform-story-tests.cjs';

const { collectWdioTests, compileWdioTest } = storyTests;

export type ExtractedWdioStory = {
  digest: string;
  tests: readonly { name?: string; code: string }[];
};

export function extractWdioTests(code: string, sourceFile: string): ReadonlyMap<string, ExtractedWdioStory> {
  const tests = new Map<string, ExtractedWdioStory>();
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
            for (const [exportName, { callbacks, value }] of collectWdioTests(program)) {
              const compiled = callbacks.map(({ callback, name }) => ({
                ...(name === undefined ? {} : { name }),
                code: compileWdioTest(callback, sourceFile, code),
              }));
              const source = code.slice(value.node.start!, value.node.end!);
              tests.set(exportName, {
                tests: compiled,
                digest: createHash('sha256')
                  .update(source)
                  .update('\0')
                  .update(value.isObjectExpression() ? JSON.stringify(compiled) : compiled[0].code)
                  .digest('hex'),
              });
            }
          },
        },
      }),
    ],
  });
  return tests;
}
