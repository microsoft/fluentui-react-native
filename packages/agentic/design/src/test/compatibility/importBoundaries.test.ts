import { parse } from '@babel/parser';
import fs from 'node:fs';
import path from 'node:path';

type Statement = ReturnType<typeof parse>['program']['body'][number];

const srcRoot = path.resolve(__dirname, '../..');
const platformSuffixes = ['android', 'ios', 'macos', 'native', 'win32', 'windows'];

type ImportEdge = { specifier: string; typeOnly: boolean };

function toSrcPath(file: string): string {
  return path.relative(srcRoot, file).split(path.sep).join('/');
}

const statementCache = new Map<string, Statement[]>();

function readStatements(file: string): Statement[] {
  let statements = statementCache.get(file);
  if (!statements) {
    const plugins: ('typescript' | 'jsx')[] = file.endsWith('.tsx') ? ['typescript', 'jsx'] : ['typescript'];
    statements = parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins }).program.body;
    statementCache.set(file, statements);
  }
  return statements;
}

function readImports(file: string): ImportEdge[] {
  const edges: ImportEdge[] = [];
  for (const statement of readStatements(file)) {
    if (statement.type === 'ImportDeclaration') {
      const typeOnly =
        statement.importKind === 'type' ||
        (statement.specifiers.length > 0 &&
          statement.specifiers.every((specifier) => specifier.type === 'ImportSpecifier' && specifier.importKind === 'type'));
      edges.push({ specifier: statement.source.value, typeOnly });
    } else if (statement.type === 'ExportNamedDeclaration' && statement.source) {
      const typeOnly =
        statement.exportKind === 'type' ||
        (statement.specifiers.length > 0 &&
          statement.specifiers.every((specifier) => specifier.type === 'ExportSpecifier' && specifier.exportKind === 'type'));
      edges.push({ specifier: statement.source.value, typeOnly });
    } else if (statement.type === 'ExportAllDeclaration') {
      edges.push({ specifier: statement.source.value, typeOnly: statement.exportKind === 'type' });
    }
  }
  return edges;
}

function isFile(candidate: string): boolean {
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile();
}

/** Resolve a relative specifier to every platform file Metro or esbuild could select. */
function resolveRelative(fromFile: string, specifier: string): string[] {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const exact = [base, `${base}.ts`, `${base}.tsx`, `${base}.json`].find(isFile);
  const variants = platformSuffixes.flatMap((platform) => [`${base}.${platform}.ts`, `${base}.${platform}.tsx`]).filter(isFile);
  const resolved = exact ? [exact, ...variants] : variants;
  if (resolved.length === 0) {
    const index = [path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find(isFile);
    if (index) {
      resolved.push(index);
    }
  }
  if (resolved.length === 0) {
    throw new Error(`Cannot resolve "${specifier}" from ${toSrcPath(fromFile)}.`);
  }
  return resolved;
}

function runtimeGraph(entry: string): Set<string> {
  const reached = new Set<string>();
  const pending = [path.join(srcRoot, entry)];
  while (pending.length > 0) {
    const file = pending.pop() as string;
    const srcPath = toSrcPath(file);
    if (reached.has(srcPath)) {
      continue;
    }
    reached.add(srcPath);
    if (file.endsWith('.json')) {
      continue;
    }
    for (const edge of readImports(file)) {
      if (!edge.typeOnly && edge.specifier.startsWith('.')) {
        pending.push(...resolveRelative(file, edge.specifier));
      }
    }
  }
  return reached;
}

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listSourceFiles(file);
    }
    return /\.tsx?$/.test(entry.name) ? [file] : [];
  });
}

function isTestSource(srcPath: string): boolean {
  return srcPath.startsWith('test/') || srcPath.includes('/__tests__/') || /\.test(\.[a-z0-9]+)?\.tsx?$/.test(srcPath);
}

function reachedUnder(graph: Set<string>, prefix: string): string[] {
  return [...graph].filter((file) => file.startsWith(prefix)).sort();
}

function isTypeOnlyStatement(statement: Statement): boolean {
  switch (statement.type) {
    case 'TSTypeAliasDeclaration':
    case 'TSInterfaceDeclaration':
      return true;
    case 'ImportDeclaration':
    case 'ExportNamedDeclaration':
    case 'ExportAllDeclaration':
      if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
        return statement.declaration.type === 'TSTypeAliasDeclaration' || statement.declaration.type === 'TSInterfaceDeclaration';
      }
      return statement.type === 'ImportDeclaration' ? statement.importKind === 'type' : statement.exportKind === 'type';
    default:
      return false;
  }
}

const productionFiles = listSourceFiles(srcRoot).filter((file) => !isTestSource(toSrcPath(file)));

describe('production code never depends on test collateral', () => {
  it('resolves test-only imports when they exist', () => {
    const testImporter = path.join(srcRoot, 'fluent/__tests__/themeReference.test.ts');
    const resolvedTestImports = readImports(testImporter)
      .filter((edge) => edge.specifier.startsWith('.'))
      .flatMap((edge) => resolveRelative(testImporter, edge.specifier).map(toSrcPath));
    expect(resolvedTestImports).toContain('test/index.ts');
  });

  it('has no production import of src/test or the testing entry point', () => {
    expect(productionFiles.length).toBeGreaterThan(50);
    const violations = productionFiles.flatMap((file) =>
      readImports(file)
        .filter((edge) =>
          edge.specifier.startsWith('.')
            ? resolveRelative(file, edge.specifier).some((resolved) => toSrcPath(resolved).startsWith('test/'))
            : edge.specifier === '@fluentui-react-native/design/testing',
        )
        .map((edge) => `${toSrcPath(file)} -> ${edge.specifier}`),
    );
    expect(violations).toEqual([]);
  });
});

describe('runtime graph ownership', () => {
  const legacyThemingGraph = runtimeGraph('theming/index.ts');

  it('detects the legacy projection and payloads from the legacy theming entry', () => {
    expect(legacyThemingGraph).toContain('fluent/useTheme.ts');
    expect(legacyThemingGraph).toContain('fluent/compat/themeFromFlexTokens.ts');
    expect(reachedUnder(legacyThemingGraph, 'fluent/tokens/').length).toBeGreaterThan(0);
  });

  it('keeps the modern root free of legacy Fluent runtime and test collateral', () => {
    const rootGraph = runtimeGraph('index.ts');
    expect(rootGraph).toContain('flex/useThemeState.ts');
    expect(rootGraph).toContain('flex/flexThemeReference.ts');
    expect(rootGraph).toContain('flex/adapters/flexTokensFromTheme.ts');
    expect(rootGraph).toContain('flex/colors/interactionPolicy.ts');
    expect(rootGraph).toContain('color-lib/interaction.ts');
    expect(rootGraph).toContain('theming/ThemeProvider.tsx');
    expect(reachedUnder(rootGraph, 'fluent/')).toEqual([]);
    expect(reachedUnder(rootGraph, 'test/')).toEqual([]);
  });

  it('keeps legacy theme runtime free of the Flex engine and color library', () => {
    for (const entry of ['fluent/useTheme.ts', 'fluent/themeReference.ts', 'theming/ThemeProvider.tsx']) {
      const graph = runtimeGraph(entry);
      expect([entry, reachedUnder(graph, 'flex/')]).toEqual([entry, []]);
      expect([entry, reachedUnder(graph, 'color-lib/')]).toEqual([entry, []]);
    }
    expect(runtimeGraph('theming/ThemedRoot.tsx')).toContain('flex/colors/interactionPolicy.ts');
  });

  it('keeps the forward Theme adapter and its Fluent fallback free of the interaction engine', () => {
    const adapterGraph = runtimeGraph('flex/adapters/flexTokensFromTheme.ts');
    expect(adapterGraph).toContain('flex/adapters/fluentFallbackTokens.ts');
    expect(adapterGraph).not.toContain('flex/colors/interactionPolicy.ts');
    expect(adapterGraph).not.toContain('flex/defaults/defaultTokens.ts');
    expect(reachedUnder(adapterGraph, 'color-lib/')).toEqual([]);
  });

  it('keeps the color library free of token, theme, and test ownership', () => {
    const colorLibGraph = runtimeGraph('color-lib/index.ts');
    expect(colorLibGraph).toContain('color-lib/interaction.ts');
    expect([...colorLibGraph].filter((file) => !file.startsWith('color-lib/')).sort()).toEqual([]);
  });

  it('keeps the shared styling entry free of legacy Fluent runtime', () => {
    const stylingGraph = runtimeGraph('styling/index.ts');
    expect(stylingGraph).toContain('flex/styling/colorStyles.ts');
    expect(reachedUnder(stylingGraph, 'fluent/')).toEqual([]);
    expect(reachedUnder(stylingGraph, 'test/')).toEqual([]);
  });

  it('keeps the legacy-source entry free of the projection and legacy payloads', () => {
    const legacySourceGraph = runtimeGraph('fluent/legacySource.ts');
    expect(legacySourceGraph).toContain('fluent/themeReference.ts');
    expect(reachedUnder(legacySourceGraph, 'fluent/compat/')).toEqual([]);
    expect(reachedUnder(legacySourceGraph, 'fluent/tokens/')).toEqual([]);
  });
});

describe('shared types', () => {
  it('contain only type declarations and type-only imports', () => {
    const typeFiles = listSourceFiles(path.join(srcRoot, 'types'));
    expect(typeFiles.map(toSrcPath).sort()).toEqual(expect.arrayContaining(['types/appearance.types.ts', 'types/themeState.types.ts']));
    const runtimeStatements = typeFiles.flatMap((file) =>
      readStatements(file)
        .filter((statement) => !isTypeOnlyStatement(statement))
        .map((statement) => `${toSrcPath(file)}:${statement.loc?.start.line} ${statement.type}`),
    );
    expect(runtimeStatements).toEqual([]);
  });

  it('reject runtime statements', () => {
    const runtimeModule = path.join(srcRoot, 'theming/appearance.ts');
    expect(readStatements(runtimeModule).some((statement) => !isTypeOnlyStatement(statement))).toBe(true);
  });
});
