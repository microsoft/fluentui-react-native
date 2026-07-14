import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Button } from '@fluentui/react-native';

import type { ComponentMetadata } from '../component/ComponentMetadata.ts';
import { analyzeComponent } from '../component/analyzeComponent.ts';
import { runComponentMatrix } from '../component/runComponentMatrix.ts';
import { validateMetadata } from '../component/validateMetadata.ts';
import { serializeA11yTree } from '../a11y/serializeA11yTree.ts';
import { createTestTheme } from '../theme/createTestTheme.ts';
import { serializeRenderTree } from '../tree/serializeRenderTree.ts';

describe('analyzeButton artifact writer', () => {
  it('runs analyzer stages and writes JSON artifacts', async () => {
    const metadata: ComponentMetadata = {
      name: 'Button',
      importPath: '@fluentui-react-native/button',
      exportName: 'Button',
      baseProps: { children: 'Analyze', testID: 'button-root' },
      states: [
        { id: 'default' },
        { id: 'disabled', props: { disabled: true } },
        { id: 'pressed', interactions: [{ kind: 'press', targetTestID: 'button-root' }] },
      ],
    };

    const validation = validateMetadata(metadata);
    expect(validation.metadata).not.toBeNull();

    const themeBundle = createTestTheme();
    const matrix = await runComponentMatrix(Button, metadata, { themeBundle });
    const analysis = await analyzeComponent({ Component: Button, metadata, options: { themeBundle } });

    const outputDir = resolveOutputDir();
    await mkdir(outputDir, { recursive: true });

    await writeJson(path.join(outputDir, 'componentMetadata.input.json'), metadata);
    await writeJson(path.join(outputDir, 'validation.result.json'), validation);
    await writeJson(path.join(outputDir, 'matrix.result.json'), matrix);
    await writeJson(path.join(outputDir, 'analysis.result.json'), analysis);
    await writeJson(path.join(outputDir, 'registry.entries.json'), themeBundle.registry.entries());

    const defaultSnapshot = matrix.data.snapshots.find((snapshot) => snapshot.state.id === 'default') ?? matrix.data.snapshots[0];
    expect(defaultSnapshot).toBeDefined();

    if (defaultSnapshot?.renderTree) {
      await writeFile(path.join(outputDir, 'default.renderTree.json'), serializeRenderTree(defaultSnapshot.renderTree), 'utf8');
    }

    if (defaultSnapshot?.a11yTree) {
      await writeFile(path.join(outputDir, 'default.a11yTree.json'), serializeA11yTree(defaultSnapshot.a11yTree), 'utf8');
    }

    if (defaultSnapshot?.tokenMap) {
      await writeJson(path.join(outputDir, 'default.tokenMap.json'), defaultSnapshot.tokenMap);
    }

    expect(existsSync(path.join(outputDir, 'analysis.result.json'))).toBe(true);
  });
});

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function resolveOutputDir(): string {
  const cwd = process.cwd();
  const workspaceCandidate = path.join(cwd, 'packages', 'ai', 'analyzer');
  const packageRoot =
    existsSync(path.join(workspaceCandidate, 'package.json')) && existsSync(path.join(workspaceCandidate, 'src'))
      ? workspaceCandidate
      : cwd;

  return path.join(packageRoot, 'src', '__test-output__', 'analyzeButton');
}
