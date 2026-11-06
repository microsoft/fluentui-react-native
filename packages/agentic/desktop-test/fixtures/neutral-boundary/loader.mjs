const workspaceEntryPoints = new Map([
  ['@fluentui-react-native/desktop-driver', new URL('../../../desktop-driver/lib/index.js', import.meta.url).href],
  ['@fluentui-react-native/desktop-test', new URL('../../../desktop-test/lib/index.js', import.meta.url).href],
  ['@fluentui-react-native/desktop-driver-mcp', new URL('../../../desktop-driver-mcp/lib/index.js', import.meta.url).href],
]);

const forbiddenPackages = new Set(['react', 'react-dom', 'react-native', 'storybook', '@types/react', '@types/react-native']);

function packageName(specifier) {
  const segments = specifier.split('/');
  return specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
}

function isForbidden(specifier) {
  const name = packageName(specifier);
  return (
    forbiddenPackages.has(name) ||
    name.startsWith('@react-native/') ||
    name.startsWith('@storybook/') ||
    name.startsWith('@fluentui-react-native/storybook-') ||
    name.startsWith('storybook-')
  );
}

export async function resolve(specifier, context, nextResolve) {
  if (isForbidden(specifier)) {
    throw new Error(`Neutral package boundary rejected forbidden import: ${specifier}`);
  }

  if (specifier === '@fluentui-react-native/desktop-driver' && context.parentURL?.includes('/desktop-driver-mcp/')) {
    throw new Error('Neutral package boundary rejected desktop-driver root import from the MCP adapter.');
  }

  const packageName = specifier.split('/').slice(0, 2).join('/');
  const workspaceParentURL = workspaceEntryPoints.get(packageName);
  if (workspaceParentURL) {
    return nextResolve(specifier, { ...context, parentURL: workspaceParentURL });
  }

  return nextResolve(specifier, context);
}
