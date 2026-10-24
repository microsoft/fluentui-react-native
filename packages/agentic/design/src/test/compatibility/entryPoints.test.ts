type ExportConditions = {
  types: string;
  'react-native': string;
  import: string;
  default: string;
};

type PackageJson = {
  exports: Record<string, ExportConditions | string>;
};

const packageJson = jest.requireActual<PackageJson>('../../../package.json');

const publicEntryPoints = [
  '.',
  './tokens/global',
  './tokens/legacy',
  './color-lib',
  './theming',
  './theming/legacy-source',
  './theming/compat',
  './theming/compat/defaults',
  './testing',
  './styling',
  './styling/stylesheet',
  './styling/tokens',
];

const moduleEntries = Object.entries(packageJson.exports).filter(([key]) => key !== './package.json') as [string, ExportConditions][];

function sourceStem(target: string): string {
  const prefix = './src/';
  const extension = target.endsWith('.tsx') ? '.tsx' : '.ts';
  expect(target.startsWith(prefix)).toBe(true);
  expect(target.endsWith(extension)).toBe(true);
  return target.slice(prefix.length, target.length - extension.length);
}

function describeExports(moduleExports: Record<string, unknown>): string[] {
  return Object.keys(moduleExports)
    .sort()
    .map((name) => `${name}: ${typeof moduleExports[name]}`);
}

describe('public entry points', () => {
  it('retains every supported package subpath', () => {
    expect(Object.keys(packageJson.exports).sort()).toEqual([...publicEntryPoints, './package.json'].sort());
    expect(packageJson.exports['./package.json']).toBe('./package.json');
  });

  it.each(moduleEntries)('%s keeps mirrored types, react-native, import, and default conditions', (_key, conditions) => {
    expect(Object.keys(conditions)).toEqual(['types', 'react-native', 'import', 'default']);
    expect(conditions.default).toBe(conditions['react-native']);

    const stem = sourceStem(conditions['react-native']);
    expect(conditions.types).toBe(`./lib/${stem}.d.ts`);
    expect(conditions.import).toBe(`./lib/${stem}.js`);
  });

  it.each(moduleEntries)('%s keeps its runtime export names', (_key, conditions) => {
    const moduleExports = jest.requireActual<Record<string, unknown>>(`../../../${conditions['react-native'].slice(2)}`);

    expect(describeExports(moduleExports)).toMatchSnapshot();
  });
});
