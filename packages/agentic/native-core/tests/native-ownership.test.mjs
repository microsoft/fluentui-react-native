import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
const require = createRequire(import.meta.url);

test('owns one codegen boundary for both native components and future modules', () => {
  assert.equal(manifest.codegenConfig.name, 'FRNNativeCoreSpec');
  assert.equal(manifest.codegenConfig.type, 'all');
  assert.equal(manifest.codegenConfig.jsSrcsDir, 'src/specs');
  assert.notEqual(manifest.codegenConfig.includesGeneratedCode, true);
  assert.deepEqual(manifest.codegenConfig.ios.componentProvider, {
    Callout: 'RCTCalloutComponentView',
    FocusZone: 'RCTFocusZoneComponentView',
  });
  assert.deepEqual(manifest.codegenConfig.windows.generators, ['componentsWindows', 'modulesWindows']);
});

test('autolinks one Fabric-only Windows library registering both components', async () => {
  const config = require('../react-native.config.cjs');
  assert.deepEqual(config.dependency.platforms.windows.projects, [
    { projectFile: 'NativeCore/NativeCore.vcxproj', directDependency: true },
  ]);

  const project = await readFile(new URL('windows/NativeCore/NativeCore.vcxproj', packageRoot), 'utf8');
  assert.match(project, /<RnwNewArchOnly>true<\/RnwNewArchOnly>/);
  assert.match(project, /components\\Callout\\Callout\.cpp/);
  assert.match(project, /components\\FocusZone\\FocusZoneComponentView\.cpp/);
  const provider = await readFile(new URL('windows/NativeCore/ReactPackageProvider.cpp', packageRoot), 'utf8');
  assert.match(provider, /RegisterCalloutComponentView\(packageBuilder\)/);
  assert.match(provider, /RegisterFocusZoneComponentView\(packageBuilder\)/);
});

test('the shared macOS pod includes both components and retains both renderer adapters', async () => {
  const podspec = await readFile(new URL('FRNNativeCore.podspec', packageRoot), 'utf8');
  assert.match(podspec, /s\.name\s*=\s*'FRNNativeCore'/);
  assert.match(podspec, /macos\/\*\*\/\*\.\{swift,h,m,mm\}/);

  for (const component of ['Callout', 'FocusZone']) {
    const fabric = await readFile(new URL(`macos/components/${component}/fabric/RCT${component}ComponentView.mm`, packageRoot), 'utf8');
    assert.match(fabric, /react\/renderer\/components\/FRNNativeCoreSpec\/Props\.h/);
    assert.ok((await readdir(new URL(`macos/components/${component}/paper/`, packageRoot))).length > 0);
    assert.ok((await readdir(new URL(`macos/components/${component}/shared/`, packageRoot))).length > 0);
  }
});

for (const shim of ['callout', 'focus-zone']) {
  test(`${shim} is a JS-only compatibility shim with no duplicate native ownership`, async () => {
    const root = new URL(`../../shim/${shim}/`, packageRoot);
    const shimManifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
    assert.equal(shimManifest.dependencies[manifest.name], 'workspace:*');
    assert.equal(shimManifest.codegenConfig, undefined);
    assert.equal(shimManifest['react-native-windows'], undefined);
    const files = await readdir(root);
    assert.ok(!files.some((file) => file.endsWith('.podspec') || ['macos', 'windows', 'react-native.config.cjs'].includes(file)));
    const entrypoint = await readFile(new URL('src/index.ts', root), 'utf8');
    assert.match(entrypoint, /from '@fluentui-react-native\/native-core'/);
    assert.doesNotMatch(entrypoint, /export \*/);
  });
}
