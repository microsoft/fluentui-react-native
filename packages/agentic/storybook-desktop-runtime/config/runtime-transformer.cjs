const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { requireModuleFromMetro } = require('@rnx-kit/tools-react-native/metro');

function withPrivateRuntimeProjection(config, projection, paths = path) {
  if (config.projectRoot && paths.isAbsolute(paths.relative(config.projectRoot, projection.modulePath))) {
    throw new Error('Desktop Storybook runtime stub must be on the Metro project volume.');
  }
  const resolveRequest = config.resolver.resolveRequest;
  return {
    ...config,
    resolver: {
      ...config.resolver,
      resolveRequest: (...args) => {
        const resolution = resolveRequest(...args);
        if (resolution?.type === 'sourceFile' && paths.relative(resolution.filePath, projection.sourcePath) === '') {
          return { type: 'sourceFile', filePath: projection.modulePath };
        }
        return resolution;
      },
    },
    transformerPath: __filename,
    transformer: {
      ...config.transformer,
      storybookRuntimeProjection: { ...projection, transformerPath: config.transformerPath },
    },
  };
}

function getDelegate(config, projectRoot) {
  const { storybookRuntimeProjection: projection, ...delegateConfig } = config;
  const transformer = requireModuleFromMetro(projection.transformerPath, projectRoot);
  return { delegateConfig, projection, transformer };
}

function getCacheKey(config, options) {
  const { delegateConfig, projection, transformer } = getDelegate(config, options?.projectRoot);
  return [
    transformer.getCacheKey?.(delegateConfig, options) || '',
    createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
    projection.modulePath,
    projection.digest,
  ].join('$');
}

function transform(config, projectRoot, filename, data, options) {
  const { delegateConfig, projection, transformer } = getDelegate(config, projectRoot);
  if (path.relative(path.resolve(projectRoot, filename), projection.modulePath) === '') {
    // Only the workspace stub enters Metro's file map. Read the independently pinned private data directly here:
    // TreeFS cannot represent a per-user source on C: relative to a workspace on D:.
    data = fs.readFileSync(projection.sourcePath);
    if (createHash('sha256').update(data).digest('hex') !== projection.digest) {
      throw new Error('Desktop Storybook runtime module does not match the trusted parent handoff.');
    }
  }
  return transformer.transform(delegateConfig, projectRoot, filename, data, options);
}

module.exports = { getCacheKey, transform, withPrivateRuntimeProjection };
