import type { PackageManifest } from './manifest.ts';

import fs from 'node:fs';
import path from 'node:path';

export const REPO_TASKS = ['build', 'test', 'format', 'lint', 'lint-package'] as const;
export type RepoTask = (typeof REPO_TASKS)[number];

export type IsEnabled = (root: string, manifest: PackageManifest) => boolean;

export type TaskDetails = {
  /** name for convenience, will also be the record key */
  name: RepoTask;
  /** function to check whether this operation is enabled for this package */
  isEnabled: IsEnabled;
  /** dev dependencies required for this task */
  devDependencies?: Record<string, string>;
  /** dependencies injected into the environment for this task via dynamic dependencies */
  injectedDependencies?: Record<string, string>;
};

function hasConfig(root: string, configName: string): boolean {
  return fs.existsSync(path.join(root, configName));
}

/** the set of workspace configuration packages that can be managed */
export const workspaceConfigPackages = [
  '@fluentui-react-native/babel-config',
  '@fluentui-react-native/config',
  '@fluentui-react-native/eslint-config-rules',
  '@fluentui-react-native/kit-config',
  '@fluentui-react-native/jest-config',
  '@fluentui-react-native/react-config',
  '@fluentui-react-native/scripts',
];

/** packages that can be added manually, even if they are not part of the managed workspace configuration */
export const workspaceStickyPackages = ['@fluentui-react-native/config', '@fluentui-react-native/scripts'];

export const repoTasks: Record<RepoTask, TaskDetails> = {
  build: {
    name: 'build',
    isEnabled: (root, manifest) => Boolean(manifest.scripts?.build && hasConfig(root, 'tsconfig.json')),
    devDependencies: {
      '@fluentui-react-native/config': 'workspace:*',
    },
    injectedDependencies: {
      '@typescript/native-preview': 'catalog:',
      '@types/node': 'catalog:',
      '@types/jest': 'catalog:',
    },
  },
  test: {
    name: 'test',
    isEnabled: (root, manifest) => Boolean(manifest.scripts?.test && (manifest?.jest || hasConfig(root, 'jest.config.js'))),
    devDependencies: {
      '@fluentui-react-native/config': 'workspace:*',
      '@fluentui-react-native/scripts': 'workspace:*',
    },
    injectedDependencies: {
      jest: 'catalog:',
      '@types/jest': 'catalog:',
    },
  },
  format: {
    name: 'format',
    isEnabled: (_root, manifest) => Boolean(manifest.scripts?.format || manifest.scripts?.['format:fix']),
    devDependencies: {
      '@fluentui-react-native/scripts': 'workspace:*',
    },
    injectedDependencies: {
      oxfmt: 'catalog:',
    },
  },
  lint: {
    name: 'lint',
    isEnabled: (_root, manifest) => Boolean(manifest.scripts?.lint),
    devDependencies: {
      '@fluentui-react-native/config': 'workspace:*',
      '@fluentui-react-native/scripts': 'workspace:*',
    },
    injectedDependencies: {
      eslint: 'catalog:',
    },
  },
  'lint-package': {
    name: 'lint-package',
    isEnabled: (_root, manifest) => Boolean(manifest.scripts?.['lint-package']),
    devDependencies: {
      '@fluentui-react-native/config': 'workspace:*',
      '@fluentui-react-native/scripts': 'workspace:*',
    },
  },
};

export function getInjectedDependencies(root: string, manifest: PackageManifest): Record<string, string> {
  const injected: Record<string, string> = {};
  for (const task of REPO_TASKS) {
    if (repoTasks[task].isEnabled(root, manifest) && repoTasks[task].injectedDependencies) {
      Object.assign(injected, repoTasks[task].injectedDependencies);
    }
  }
  return injected;
}

export function getWorkspaceDevDeps(root: string, manifest: PackageManifest): [string[], string[]] {
  const devDeps: string[] = [];
  const removedDeps: string[] = [];
  for (const task of REPO_TASKS) {
    if (repoTasks[task].isEnabled(root, manifest)) {
      for (const dep of Object.keys(repoTasks[task].devDependencies ?? {})) {
        if (workspaceConfigPackages.includes(dep) && !devDeps.includes(dep)) {
          devDeps.push(dep);
        }
      }
    }
  }
  // now see about the remove set
  for (const dep of workspaceConfigPackages) {
    if (!devDeps.includes(dep) && !workspaceStickyPackages.includes(dep)) {
      removedDeps.push(dep);
    }
  }
  return [devDeps, removedDeps];
}
