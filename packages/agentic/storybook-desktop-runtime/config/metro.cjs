const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { makeMetroConfig } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
const { withStorybook } = require('@storybook/react-native/withStorybook');

const safeAreaStub = path.resolve(__dirname, 'react-native-safe-area-context.cjs');
const runtimeInstanceStub = path.resolve(__dirname, 'runtime-instance.cjs');

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
        if (path.resolve(path.dirname(context.originModulePath), moduleName) === runtimeInstanceStub) {
          return { type: 'sourceFile', filePath: runtimeModulePath };
        }
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
  // Windows credentials live outside the workspace in a protected per-user namespace. Metro must watch the pinned
  // projection's directory to hash/import that module, without losing the workspace folders chosen by makeMetroConfig.
  config.watchFolders = [...new Set([...(config.watchFolders || []), path.dirname(runtimeModulePath)])];

  const storybookConfig = withStorybook(config, {
    configPath,
    liteMode: true,
  });
  return storybookConfig;
}

function writeRuntimeInstanceModule(projectRoot) {
  if (process.env.STORYBOOK_DRIVER_MANIFEST) {
    // The parent publishes this bridge-only module through owner-private OS storage. Metro must never copy the attach
    // credential (or trust a helper path) from an editable generated manifest.
    if (!process.env.STORYBOOK_GENERATED_CONTRACT || !path.isAbsolute(process.env.STORYBOOK_GENERATED_CONTRACT)) {
      throw new Error('Desktop Storybook Metro requires the trusted parent generated-contract locator.');
    }
    const { parseDriverManifest, parseHandoff } = require(process.env.STORYBOOK_GENERATED_CONTRACT);
    const contents = fs.readFileSync(process.env.STORYBOOK_DRIVER_MANIFEST, 'utf8');
    const manifest = parseDriverManifest(JSON.parse(contents));
    const handoff = parseHandoff(JSON.parse(process.env.STORYBOOK_DRIVER_HANDOFF || 'null'));
    if (
      createHash('sha256').update(contents).digest('hex') !== handoff.manifestDigest ||
      handoff.runtimeModulePath !== path.join(manifest.credentials.root, manifest.credentials.runtimeModule)
    ) {
      throw new Error('Desktop Storybook manifest does not match the trusted parent handoff.');
    }
    if (
      !fs.statSync(handoff.runtimeModulePath).isFile() ||
      createHash('sha256').update(fs.readFileSync(handoff.runtimeModulePath)).digest('hex') !== handoff.runtimeModuleDigest
    ) {
      throw new Error('Desktop Storybook runtime module does not match the trusted parent handoff.');
    }
    return handoff.runtimeModulePath;
  }
  const generatedDirectory = path.join(projectRoot, 'storybook-desktop.generated');
  const runtimeModulePath = path.join(generatedDirectory, 'runtime-instance.js');
  const storybookPort = readPort(process.env.STORYBOOK_WS_PORT, 7007);
  const instanceId = process.env.FURN_STORYBOOK_INSTANCE_ID || 'default';
  const runtimeInstance = {
    instanceId,
    storybookPort,
  };
  const content = `export default ${JSON.stringify(runtimeInstance)};\n`;

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
