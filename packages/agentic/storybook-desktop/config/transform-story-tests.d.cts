import type { NodePath, PluginObj, types } from '@babel/core';

declare function storyTests(): PluginObj;

declare namespace storyTests {
  type StoryTest = {
    callback: NodePath<types.FunctionExpression | types.ArrowFunctionExpression>;
    property: NodePath<types.ObjectProperty>;
  };

  function collectWdioTests(program: NodePath<types.Program>): ReadonlyMap<string, StoryTest>;
  function compileWdioTest(callback: StoryTest['callback'], sourceFile: string, source: string): string;
}

export = storyTests;
