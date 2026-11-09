import type { NodePath, PluginObj, types } from '@babel/core';

declare function storyTests(): PluginObj;

declare namespace storyTests {
  type Callback = {
    name?: string;
    options?: Record<string, unknown>;
    callback: NodePath<types.FunctionExpression | types.ArrowFunctionExpression>;
  };
  type StoryTest = {
    callbacks: readonly Callback[];
    property: NodePath<types.ObjectProperty>;
    value: NodePath<types.FunctionExpression | types.ArrowFunctionExpression | types.ObjectExpression | types.ArrayExpression>;
  };

  function collectWdioTests(program: NodePath<types.Program>): ReadonlyMap<string, StoryTest>;
  function compileWdioTest(callback: Callback['callback'], sourceFile: string, source: string): string;
  function rejectDirectInput(
    callback: Callback['callback'],
    descriptor: {
      name?: string;
      input: 'accessible' | 'physical' | 'both';
      inputSource: 'declared' | 'derived';
      /** The story file, so helpers imported from relative modules are followed. */
      sourceFile?: string;
    },
  ): void;
}

export = storyTests;
