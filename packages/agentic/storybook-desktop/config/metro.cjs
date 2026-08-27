const fs = require('node:fs');
const path = require('node:path');
const { makeMetroConfig } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
const { withStorybook } = require('@storybook/react-native/withStorybook');

const safeAreaStub = path.resolve(__dirname, 'react-native-safe-area-context.cjs');

function resolvePlatformModule(moduleName, platform) {
  if (platform !== 'win32') {
    return moduleName;
  }

  if (moduleName === 'react-native') {
    return '@office-iss/react-native-win32';
  }

  if (moduleName.startsWith('react-native/')) {
    return `@office-iss/react-native-win32/${moduleName.slice('react-native/'.length)}`;
  }

  return moduleName;
}

function createDesktopStorybookMetroConfig({ configPath }) {
  if (!configPath) {
    throw new TypeError('createDesktopStorybookMetroConfig requires an app-owned Storybook configPath.');
  }

  const runtimeModulePath = writeRuntimeInstanceModule(path.dirname(configPath));
  const symlinkResolver = MetroSymlinksResolver({
    resolver: 'oxc-resolver',
  });
  const config = makeMetroConfig({
    resolver: {
      resolveRequest: (context, moduleName, platform) => {
        // Storybook's path-based lite-mode mock does not recognize Yarn's virtual pnpm paths.
        if (moduleName === '@storybook/react-native-ui' || moduleName.startsWith('@storybook/react-native-ui/')) {
          return { type: 'empty' };
        }
        if (moduleName === 'react-native-safe-area-context') {
          return { type: 'sourceFile', filePath: safeAreaStub };
        }
        return symlinkResolver(context, resolvePlatformModule(moduleName, platform), platform);
      },
      unstable_enablePackageExports: true,
      unstable_conditionNames: ['react-native', 'import', 'require'],
      disableHierarchicalLookup: true,
      enableSymlinks: true,
    },
    transformer: {
      unstable_allowRequireContext: true,
    },
  });

  const storybookConfig = withStorybook(config, {
    configPath,
    liteMode: true,
  });
  const getPolyfills = storybookConfig.serializer?.getPolyfills;

  return {
    ...storybookConfig,
    serializer: {
      ...storybookConfig.serializer,
      getPolyfills: (...args) => [...(getPolyfills?.(...args) ?? []), runtimeModulePath],
    },
  };
}

function writeRuntimeInstanceModule(projectRoot) {
  const generatedDirectory = path.join(projectRoot, 'storybook-desktop.generated');
  const runtimeModulePath = path.join(generatedDirectory, 'runtime-instance.js');
  const storybookPort = readPort(process.env.STORYBOOK_WS_PORT, 7007);
  const instanceId = process.env.FURN_STORYBOOK_INSTANCE_ID || 'default';
  const content = `globalThis.__FURN_DESKTOP_STORYBOOK_INSTANCE__ = Object.freeze(${JSON.stringify({
    instanceId,
    storybookPort,
  })});\n`;

  fs.mkdirSync(generatedDirectory, { recursive: true });
  if (!fs.existsSync(runtimeModulePath) || fs.readFileSync(runtimeModulePath, 'utf8') !== content) {
    fs.writeFileSync(runtimeModulePath, content);
  }
  return runtimeModulePath;
}

function readPort(value, fallback) {
  const port = Number(value) || fallback;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new RangeError(`Invalid Storybook port "${value}".`);
  }
  return port;
}

module.exports = {
  createDesktopStorybookMetroConfig,
};
