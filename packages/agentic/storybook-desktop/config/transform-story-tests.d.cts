import type { NodePath, PluginObj, types } from '@babel/core';

declare function storyTests(): PluginObj;

declare namespace storyTests {
  type Callback = {
    name?: string;
    callback: NodePath<types.FunctionExpression | types.ArrowFunctionExpression>;
  };
  type StoryTest = {
    callbacks: readonly Callback[];
    property: NodePath<types.ObjectProperty>;
    value: NodePath<types.FunctionExpression | types.ArrowFunctionExpression | types.ObjectExpression>;
  };

  function collectWdioTests(program: NodePath<types.Program>): ReadonlyMap<string, StoryTest>;
  function compileWdioTest(callback: Callback['callback'], sourceFile: string, source: string): string;
}

export = storyTests;
