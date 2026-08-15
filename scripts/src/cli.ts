#!/usr/bin/env node

import { Builtins, Cli } from 'clipanion';
import { CleanCommand } from './tasks/clean.ts';
import { FormatCommand } from './tasks/format.ts';
import { LintCommand } from './tasks/lint.ts';
import { JestCommand } from './tasks/jest.ts';
import { CheckPublishingCommand } from './tasks/checkPublishingTask.ts';

const cli = new Cli({
  binaryLabel: 'fluentui-scripts CLI',
  binaryName: '@fluentui-react-native/scripts',
  binaryVersion: '0.0.0',
});

cli.register(CleanCommand);
cli.register(FormatCommand);
cli.register(LintCommand);
cli.register(JestCommand);
cli.register(CheckPublishingCommand);

cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(process.argv.slice(2));
