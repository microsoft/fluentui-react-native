const sourceExtensions = ['tsx', 'ts', 'jsx', 'js'];

export const externalPackages = [
  'react-native',
  'react',
  '@svgo',
  'react-native-svg',
  'react-native-windows',
  'react-native-macos',
  '@office-iss/react-native-win32',
];

export function getResolveExtensions(platform) {
  return [
    ...sourceExtensions.map((extension) => `.${platform}.${extension}`),
    ...sourceExtensions.map((extension) => `.native.${extension}`),
    ...sourceExtensions.map((extension) => `.${extension}`),
    '.mjs',
    '.cjs',
    '.json',
  ];
}

export function createEsbuildOptions({ bundlePath, entryPath, platform, workspaceRoot }) {
  return {
    absWorkingDir: workspaceRoot,
    bundle: true,
    conditions: ['react-native'],
    entryPoints: [entryPath],
    external: externalPackages.flatMap((packageName) => [packageName, `${packageName}/*`]),
    format: 'esm',
    jsx: 'automatic',
    legalComments: 'none',
    mainFields: ['react-native', 'module', 'main'],
    metafile: true,
    minify: true,
    outfile: bundlePath,
    platform: 'neutral',
    resolveExtensions: getResolveExtensions(platform),
    sourcemap: 'external',
    treeShaking: true,
  };
}
