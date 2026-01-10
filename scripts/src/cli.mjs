#!/usr/bin/env node
// @ts-check

import { Builtins, Cli } from 'clipanion';
import { BuildCommand } from './tasks/build.js';
import { CleanCommand } from './tasks/clean.js';
import { HybridBuildCommand } from './tasks/hybrid-build.ts';
import { PrettierCommand } from './tasks/prettier.js';
import { LintCommand } from './tasks/eslint.js';
import { JestCommand } from './tasks/jest.js';
import { CheckChangesCommand } from './tasks/checkForModifiedFilesTask.js';
import { CheckPublishingCommand } from './tasks/checkPublishingTask.js';
import { DepcheckCommand } from './tasks/depcheck.js';

const cli = new Cli({
  binaryLabel: 'fluentui-scripts CLI',
  binaryName: '@fluentui-react-native/scripts',
  binaryVersion: '0.0.0',
});

cli.register(BuildCommand);
cli.register(CleanCommand);
cli.register(HybridBuildCommand);
cli.register(PrettierCommand);
cli.register(LintCommand);
cli.register(JestCommand);
cli.register(CheckChangesCommand);
cli.register(CheckPublishingCommand);
cli.register(DepcheckCommand);

cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(process.argv.slice(2));
